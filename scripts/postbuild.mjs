// After `vite build` and `vite build --ssr src/prerender.tsx`: gives every address the app answers its own HTML
// file, so that the server can answer anything else with a real 404 (wrangler.jsonc, not_found_handling
// "404-page").
//
// - dist/country/<ISO3>.html for each country, and dist/<page>.html for each page, each a copy of index.html with
//   its own title, description and canonical address, and with the page's static HTML in #root: the app itself,
//   rendered at build time for the balanced weights (src/prerender.tsx), which the app replaces once it has
//   loaded. A country's description gives its score and rank, and its page has a BreadcrumbList;
// - dist/404.html, the app's "page not found", served with status 404 for any other address;
// - dist/sitemap.xml, dist/_redirects, and dist/favicon.ico (the family kit's, which browsers ask for at the root);
// - on the map views only, a preload of the figures and the map, so they download alongside the app;
// - the figures the browser loads (dist/assets/countries-*.json) without the whitespace and the publishers' raw
//   values, which the app does not use (the scores, ranks and formatted values stay);
// - while measurement is on (src/config.ts, ADS; docs/DECISIONS.md, 19), and only then: the family kit's measure.js
//   in every page's head, the Google tag's hosts in dist/_headers' content security policy, and the privacy page's
//   description to match its measurement version, which must be finished (scripts/measure.mjs).
//
// Plain Node with no dependencies beyond the app's own (React, for the static HTML), so it runs in Cloudflare's
// build as well as locally.
import { readFileSync, writeFileSync, mkdirSync, copyFileSync, readdirSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { draftProblems, measuredHeaders, withMeasure } from './measure.mjs';

const ORIGIN = 'https://wherelivesstand.com';
const dist = new URL('../dist/', import.meta.url);
const read = path => readFileSync(new URL(path, dist), 'utf8');
const write = (path, text) => {
  const url = new URL(path, dist);
  mkdirSync(new URL('.', url), { recursive: true });
  writeFileSync(url, text);
};

const ssrEntry = new URL('../dist-ssr/prerender.js', import.meta.url);
if (!existsSync(ssrEntry)) throw new Error('postbuild: dist-ssr/prerender.js is missing; run `vite build --ssr src/prerender.tsx` first');
const { render, rankings, ordinal, countries, indicators, DATA_UPDATED, MEASURE_TAG, MEASURES } = await import(ssrEntry);
const { list, rankedCount: ranked } = rankings;
const index = read('index.html');

const assets = readdirSync(new URL('assets/', dist));
const asset = prefix => assets.find(f => f.startsWith(prefix) && f.endsWith('.json'));
// The map views need the figures and the map soon, but after the stylesheets and typefaces that the static HTML
// is drawn with (fetchpriority low). The text pages show their static HTML until the app has fetched the figures,
// so they leave the bandwidth to the page itself.
const MAP_PRELOADS = ['countries-', 'world-50m-']
  .map(asset)
  .filter(Boolean)
  .map(f => `<link rel="preload" href="/assets/${f}" as="fetch" crossorigin fetchpriority="low">`)
  .join('\n    ');
// The two typefaces every page's text is set in (the family kit's upright Latin files), so that they arrive with
// the stylesheets rather than after them and the static HTML isn't redrawn, and shifted, when they do
const FONT_PRELOADS = [...read('family/fonts.css').matchAll(/url\((fonts\/source-(?:serif-4|sans-3)-normal-latin\.woff2)\)/g)]
  .map(m => `<link rel="preload" href="/family/${m[1]}" as="font" type="font/woff2" crossorigin>`)
  .join('\n    ');
if (!FONT_PRELOADS.includes('serif') || !FONT_PRELOADS.includes('sans')) throw new Error('postbuild: the typefaces were not found in family/fonts.css');

// The served copy of the figures, minified and without the raw values. Its file name keeps the hash of the source
// file, which this always turns into the same output.
const figures = asset('countries-');
write(`assets/${figures}`, JSON.stringify(JSON.parse(read(`assets/${figures}`)), (key, value) => (key === 'raw' && typeof value === 'number' ? undefined : value)));

const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
const jsonLd = value => `<script type="application/ld+json">${JSON.stringify(value).replace(/</g, '\\u003c')}</script>`;

// What readers without JavaScript are told, above the page's static HTML
const NOSCRIPT =
  '<noscript><p class="boot__inner boot__status">Without JavaScript, this page shows the figures under the balanced weights, every dimension at 50%. Choosing your own weights, the map and the search need JavaScript.</p></noscript>';

function page({ path, title, description, noindex = false, map = false, lean = false, head = '' }) {
  let html = index;
  const url = ORIGIN + path;
  const set = (re, value) => {
    if (!re.test(html)) throw new Error(`postbuild: ${re} not found in index.html`);
    html = html.replace(re, value);
  };
  set(/<title>[^<]*<\/title>/, `<title>${esc(title)}</title>`);
  set(/(<meta name="description" content=")[^"]*/, `$1${esc(description)}`);
  set(/(<meta property="og:description" content=")[^"]*/, `$1${esc(description)}`);
  set(/(<meta property="og:title" content=")[^"]*/, `$1${esc(title)}`);
  set(/(<meta property="og:url" content=")[^"]*/, `$1${url}`);
  set(/(<link rel="canonical" href=")[^"]*/, `$1${url}`);
  if (noindex) {
    html = html.replace(/\s*<link rel="canonical"[^>]*>/, '').replace(/\s*<meta property="og:url"[^>]*>/, '');
    html = html.replace('<meta charset="UTF-8" />', '<meta charset="UTF-8" />\n    <meta name="robots" content="noindex" />');
  }
  // The static HTML replaces the loading screen. #boot-status says so if the figures cannot be loaded (main.tsx);
  // data-prerendered lets index.css hide what the static HTML cannot draw until the app takes over.
  set(
    /<div id="root">[\s\S]*<!-- \/app -->\s*<\/div>/,
    `<div id="root" data-prerendered><p id="boot-status" class="boot-status" role="status"></p>${NOSCRIPT}${render(path, { lean })}</div>`,
  );
  // The preloads early in the head, before the stylesheets, so the browser asks for them at once
  set(/(<meta name="viewport"[^>]*>)/, `$1\n    ${[FONT_PRELOADS, map ? MAP_PRELOADS : ''].filter(Boolean).join('\n    ')}`);
  if (head) html = html.replace('</head>', `  ${head}\n  </head>`);
  return MEASURE_TAG ? withMeasure(html, MEASURE_TAG, MEASURES) : html;
}

const SITE = 'Where Lives Stand';
const defaultDescription = `${SITE} ranks ${ranked} countries on quality of life from ${indicators.length} published indicators, weighted the way you choose. A Where They Stand project.`;

const pages = [
  { path: '/', file: 'index.html', title: `${SITE}: quality of life, country by country`, description: defaultDescription, map: true },
  { path: '/compare', file: 'compare.html', title: `Compare two countries | ${SITE}`, description: `Compare any two countries on quality of life, dimension by dimension and on each of ${indicators.length} published indicators.`, map: true, lean: true },
  { path: '/behind-the-rankings', file: 'behind-the-rankings.html', title: `Behind the rankings | ${SITE}`, description: `What each of the ${indicators.length} indices behind ${SITE} measures, where it falls short, and the traps in combining them.` },
  { path: '/about', file: 'about.html', title: `About | ${SITE}`, description: `What ${SITE} is, who runs it and how to contact us.` },
  { path: '/method', file: 'method.html', title: `Methodology | ${SITE}`, description: `How ${SITE} scores and combines ${indicators.length} published indicators, and the publisher, year and coverage of each.` },
  { path: '/privacy', file: 'privacy.html', title: `Privacy notice | ${SITE}`, description: MEASURE_TAG ? `${SITE} sets no cookies and measures nothing unless you agree, and never shows advertising.` : `${SITE} uses no cookies, analytics or advertising.` },
  { path: '/terms', file: 'terms.html', title: `Terms of use | ${SITE}`, description: `The terms for using ${SITE} and reusing its work: the code, the site's own text and the publishers' figures.` },
  { path: '/accessibility', file: 'accessibility.html', title: `Accessibility statement | ${SITE}`, description: `The accessibility of ${SITE}: what works, the testing done, and its known limits.` },
  { path: '/press', file: 'press.html', title: `Press and citing | ${SITE}`, description: `Contact, how to cite ${SITE} and its figures, the site in brief, and its logo files.` },
  { path: '/corrections', file: 'corrections.html', title: `Corrections and problems | ${SITE}`, description: `How to report a problem with ${SITE}, and the corrections made.` },
];
for (const p of pages) write(p.file, page(p));
if (MEASURE_TAG) {
  const problems = draftProblems(read('privacy.html'));
  if (problems.length) throw new Error(`postbuild: measurement is on, but the privacy notice isn't ready: ${problems.join('; ')} (src/pages/StandardPages.tsx)`);
  write('_headers', measuredHeaders(read('_headers'), JSON.parse(read('family/measure-csp.json'))));
}

/** A country's description: its score, rank and standouts under the balanced weights, as its static HTML shows. */
function countryDescription(c) {
  if (c.rank == null) {
    const covered = Number(c.coverage?.split('/')[0] ?? 0);
    return `${c.name} is not ranked on ${SITE}: ${covered ? `${covered} of the ${indicators.length}` : `none of the ${indicators.length}`} published quality-of-life indicators cover it, and a country needs 20. ${covered ? 'Its figures, with the year and publisher of each.' : 'Why, and how the rankings work.'}`;
  }
  const [best] = c.activeStrengths;
  const [worst] = c.activeWeaknesses;
  const standouts = [best && `Strongest: ${best.indicatorName} (${best.badgeText})`, worst && `weakest: ${worst.indicatorName} (${worst.badgeText})`].filter(Boolean).join('; ');
  return `${c.name}: ${c.compositeScore.toFixed(1)} out of 100 for quality of life, ${ordinal(c.rank)} of ${ranked} countries under the balanced weights.${standouts ? ` ${standouts.charAt(0).toUpperCase()}${standouts.slice(1)}.` : ''}`;
}

const countryPages = list.filter(c => !c.isDependency).sort((a, b) => a.iso3.localeCompare(b.iso3));
for (const c of countryPages) {
  const path = `/country/${c.iso3}`;
  const breadcrumbs = jsonLd({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: SITE, item: `${ORIGIN}/` },
      { '@type': 'ListItem', position: 2, name: c.name, item: ORIGIN + path },
    ],
  });
  write(`country/${c.iso3}.html`, page({ path, title: `${c.name} | ${SITE}`, description: countryDescription(c), map: true, lean: true, head: breadcrumbs }));
}

write('404.html', page({ path: '/404', title: `Page not found | ${SITE}`, description: defaultDescription, noindex: true }));

// When each address last changed. The country pages, the map and the comparison show the figures, so they carry
// the date the data was rebuilt (DATA_UPDATED in src/config.ts). The text pages carry the date of the last commit
// to the files that hold their text, where the git history reaches that far; otherwise none, rather than a guess.
const PAGE_SOURCES = {
  '/behind-the-rankings': ['src/pages/BehindTheRankings.tsx', 'src/data/indexBiases.ts'],
  '/method': ['src/pages/StandardPages.tsx', 'SOURCES.md'],
};
const repo = new URL('..', import.meta.url);
const git = args => execFileSync('git', args, { cwd: repo, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
function committed(files) {
  try {
    const [hash, date] = git(['log', '-1', '--format=%H %cs', '--', ...files]).split(' ');
    if (!hash) return null;
    // In a shallow clone, the oldest commit fetched seems to change every file: its date says nothing
    const shallow = git(['rev-parse', '--git-path', 'shallow']);
    if (existsSync(new URL(shallow, repo)) && readFileSync(new URL(shallow, repo), 'utf8').includes(hash)) return null;
    return date;
  } catch {
    return null;
  }
}
const lastmod = path =>
  path === '/' || path === '/compare' || path.startsWith('/country/') ? DATA_UPDATED : committed(PAGE_SOURCES[path] ?? ['src/pages/StandardPages.tsx']);
const urls = [...pages.map(p => p.path), ...countryPages.map(c => `/country/${c.iso3}`)];
write(
  'sitemap.xml',
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls
    .map(u => {
      const date = lastmod(u);
      return `  <url><loc>${ORIGIN}${u}</loc>${date ? `<lastmod>${date}</lastmod>` : ''}</url>`;
    })
    .join('\n')}\n</urlset>\n`,
);

// Places that once had a page and are now counted with another country (docs/DECISIONS.md, decision 16)
const MERGED = { CYN: 'CYP' };

// Country addresses the server would otherwise not find: lower-case codes, the codes of territories, which go
// to the country they belong to (302: their figures are not ranked separately, docs/URLS.md), and the codes in
// MERGED. Then every page's address with a trailing slash, which would otherwise get the asset server's own 307.
const redirects = [
  '# Generated by scripts/postbuild.mjs.',
  ...countryPages.map(c => `/country/${c.iso3.toLowerCase()} /country/${c.iso3} 301`),
  ...Object.values(countries)
    .filter(c => c.isDependency && c.parentIso)
    .flatMap(c => [`/country/${c.iso3} /country/${c.parentIso} 302`, `/country/${c.iso3.toLowerCase()} /country/${c.parentIso} 302`]),
  ...Object.entries(MERGED).flatMap(([from, to]) => [`/country/${from} /country/${to} 301`, `/country/${from.toLowerCase()} /country/${to} 301`]),
  ...urls.filter(u => u !== '/').map(u => `${u}/ ${u} 301`),
];
write('_redirects', redirects.join('\n') + '\n');

copyFileSync(new URL('family/favicon.ico', dist), new URL('favicon.ico', dist));

console.log(`postbuild: ${pages.length} pages, ${countryPages.length} country pages, 404.html, sitemap.xml (${urls.length} addresses)`);
