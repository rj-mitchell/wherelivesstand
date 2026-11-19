// After `vite build` and `vite build --ssr src/prerender.tsx`: gives every address the app answers its own HTML
// file, so that the server can answer anything else with a real 404 (wrangler.jsonc, not_found_handling
// "404-page").
//
// - dist/country/<ISO3>.html for each country, and dist/<page>.html for each page, each a copy of index.html with
//   its own title, description and canonical address, and with the page's static HTML in #root: the app itself,
//   rendered at build time for the balanced weights (src/prerender.tsx), which the app replaces once it has
//   loaded. A country's description gives its score and rank;
// - dist/404.html, the app's "page not found", served with status 404 for any other address;
// - dist/sitemap.xml, dist/_redirects, and dist/favicon.ico (the family kit's, which browsers ask for at the root);
// - a preload of the figures and the map in every page, so they download alongside the app.
//
// Plain Node with no dependencies beyond the app's own (React, for the static HTML), so it runs in Cloudflare's
// build as well as locally.
import { readFileSync, writeFileSync, mkdirSync, copyFileSync, readdirSync, existsSync } from 'node:fs';

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
const { render, rankings, ordinal, countries, indicators } = await import(ssrEntry);
const { list, rankedCount: ranked } = rankings;
const index = read('index.html');

const assets = readdirSync(new URL('assets/', dist));
const asset = prefix => assets.find(f => f.startsWith(prefix) && f.endsWith('.json'));
const preloads = ['countries-', 'world-50m-']
  .map(asset)
  .filter(Boolean)
  .map(f => `<link rel="preload" href="/assets/${f}" as="fetch" crossorigin>`)
  .join('\n    ');

const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');

// What readers without JavaScript are told, above the page's static HTML
const NOSCRIPT =
  '<noscript><p class="boot__inner boot__status">Without JavaScript, this page shows the figures under the balanced weights, every dimension at 50%. Choosing your own weights, the map and the search need JavaScript.</p></noscript>';

function page({ path, title, description, noindex = false, lean = false }) {
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
  return html.replace('</head>', `    ${preloads}\n  </head>`);
}

const SITE = 'Where Lives Stand';
const defaultDescription = `${SITE} ranks ${ranked} countries on quality of life from ${indicators.length} published indicators, weighted the way you choose. A Where They Stand project.`;

const pages = [
  { path: '/', file: 'index.html', title: `${SITE}: quality of life, country by country`, description: defaultDescription },
  { path: '/compare', file: 'compare.html', title: `Compare two countries | ${SITE}`, description: `Compare any two countries on quality of life, dimension by dimension and on each of ${indicators.length} published indicators.`, lean: true },
  { path: '/behind-the-rankings', file: 'behind-the-rankings.html', title: `Behind the rankings | ${SITE}`, description: `What each of the ${indicators.length} indices behind ${SITE} measures, where it falls short, and the traps in combining them.` },
  { path: '/about', file: 'about.html', title: `About | ${SITE}`, description: `What ${SITE} is, who runs it and how to contact us.` },
  { path: '/method', file: 'method.html', title: `Methodology | ${SITE}`, description: `How ${SITE} scores and combines ${indicators.length} published indicators, and the publisher, year and coverage of each.` },
  { path: '/privacy', file: 'privacy.html', title: `Privacy notice | ${SITE}`, description: `${SITE} uses no cookies, analytics or advertising.` },
  { path: '/terms', file: 'terms.html', title: `Terms of use | ${SITE}`, description: `The terms for using ${SITE} and reusing its work: the code, the site's own text and the publishers' figures.` },
  { path: '/accessibility', file: 'accessibility.html', title: `Accessibility statement | ${SITE}`, description: `The accessibility of ${SITE}: what works, the testing done, and its known limits.` },
  { path: '/press', file: 'press.html', title: `Press and citing | ${SITE}`, description: `Contact, how to cite ${SITE} and its figures, the site in brief, and its logo files.` },
  { path: '/corrections', file: 'corrections.html', title: `Corrections and problems | ${SITE}`, description: `How to report a problem with ${SITE}, and the corrections made.` },
];
for (const p of pages) write(p.file, page(p));

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
  write(`country/${c.iso3}.html`, page({ path: `/country/${c.iso3}`, title: `${c.name} | ${SITE}`, description: countryDescription(c), lean: true }));
}

write('404.html', page({ path: '/404', title: `Page not found | ${SITE}`, description: defaultDescription, noindex: true }));

const today = new Date().toISOString().slice(0, 10);
const urls = [...pages.map(p => p.path), ...countryPages.map(c => `/country/${c.iso3}`)];
write(
  'sitemap.xml',
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls
    .map(u => `  <url><loc>${ORIGIN}${u}</loc><lastmod>${today}</lastmod></url>`)
    .join('\n')}\n</urlset>\n`,
);

// Places that once had a page and are now counted with another country (docs/DECISIONS.md, decision 16)
const MERGED = { CYN: 'CYP' };

// Country addresses the server would otherwise not find: lower-case codes, the codes of territories, which go
// to the country they belong to (their figures are not ranked separately), and the codes in MERGED.
const redirects = [
  '# Generated by scripts/postbuild.mjs.',
  ...countryPages.map(c => `/country/${c.iso3.toLowerCase()} /country/${c.iso3} 301`),
  ...Object.values(countries)
    .filter(c => c.isDependency && c.parentIso)
    .flatMap(c => [`/country/${c.iso3} /country/${c.parentIso} 302`, `/country/${c.iso3.toLowerCase()} /country/${c.parentIso} 302`]),
  ...Object.entries(MERGED).flatMap(([from, to]) => [`/country/${from} /country/${to} 301`, `/country/${from.toLowerCase()} /country/${to} 301`]),
];
write('_redirects', redirects.join('\n') + '\n');

copyFileSync(new URL('family/favicon.ico', dist), new URL('favicon.ico', dist));

console.log(`postbuild: ${pages.length} pages, ${countryPages.length} country pages, 404.html, sitemap.xml (${urls.length} addresses)`);
