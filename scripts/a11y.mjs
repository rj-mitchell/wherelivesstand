// Accessibility and smoke check of the built site (dist/), run in CI after `npm run build`.
//
// Serves dist/ the way the Cloudflare Worker does (wrangler.jsonc): /about from about.html, /country/NOR from
// country/NOR.html, dist/404.html with status 404 for anything else, and the headers in dist/_headers, so the
// content security policy is the one the live site sends. Then, in Chromium, opens each page below at 1280 and
// 390 pixels wide, in light and dark mode, and:
//
// - runs axe-core against WCAG 2.2 A and AA, failing on any serious or critical violation (moderate and minor
//   ones are listed but do not fail the run);
// - fails on a console error, an uncaught exception, a content-security-policy violation or a request to any
//   other host;
// - checks a few things axe cannot: an open dialog leaves the rest of the page inert; on the map, no country
//   too small to see (under 2 pixels each way) is a Tab stop, and the map comes before the weights in the page.
//
//   npm run check:a11y                    (after npm run build; needs `npx playwright install chromium`)
//   CHROME_PATH=/usr/bin/google-chrome node scripts/a11y.mjs     to use an installed Chrome instead
//   node scripts/a11y.mjs --shots <dir>   also saves a screenshot of each page, size and mode
import { createServer } from 'node:http';
import { readFileSync, existsSync, statSync, mkdirSync } from 'node:fs';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';
import { AxeBuilder } from '@axe-core/playwright';

const dist = fileURLToPath(new URL('../dist/', import.meta.url));
if (!existsSync(join(dist, 'index.html'))) {
  console.error('a11y: dist/index.html is missing; run npm run build first');
  process.exit(1);
}
const shotsAt = process.argv.indexOf('--shots');
const shots = shotsAt > 0 ? process.argv[shotsAt + 1] : null;
if (shots) mkdirSync(shots, { recursive: true });

const PAGES = [
  { name: 'home', path: '/', ready: '#main svg path' },
  { name: 'country', path: '/country/NOR', ready: '[role="dialog"]' },
  { name: 'compare', path: '/compare?a=ESP&b=NOR', ready: '[role="dialog"]' },
  { name: 'behind-the-rankings', path: '/behind-the-rankings', ready: '#page-title' },
  { name: 'about', path: '/about', ready: '#page-title' },
  { name: 'press', path: '/press', ready: '#page-title' },
];
const SIZES = [
  { name: '1280', viewport: { width: 1280, height: 900 } },
  { name: '390', viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true },
];
const SCHEMES = ['light', 'dark'];
const FAIL_ON = new Set(['serious', 'critical']);
const TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];

// The headers for every file, from dist/_headers (only its "/*" block applies to pages)
function pageHeaders() {
  const headers = {};
  let inAll = false;
  for (const line of readFileSync(join(dist, '_headers'), 'utf8').split('\n')) {
    if (!line.trim() || line.trim().startsWith('#')) continue;
    if (!/^\s/.test(line)) {
      inAll = line.trim() === '/*';
      continue;
    }
    if (!inAll) continue;
    const i = line.indexOf(':');
    headers[line.slice(0, i).trim()] = line.slice(i + 1).trim();
  }
  return headers;
}
const HEADERS = pageHeaders();
const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.xml': 'application/xml',
  '.txt': 'text/plain',
  '.webmanifest': 'application/manifest+json',
};

function resolve(pathname) {
  const clean = normalize(decodeURIComponent(pathname)).replace(/^(\.\.[/\\])+/, '');
  const file = join(dist, clean);
  if (!file.startsWith(dist)) return null;
  for (const f of [file, `${file}.html`, join(file, 'index.html')]) {
    if (existsSync(f) && statSync(f).isFile()) return f;
  }
  return null;
}

const server = createServer((req, res) => {
  const { pathname } = new URL(req.url, 'http://localhost');
  const file = resolve(pathname);
  const status = file ? 200 : 404;
  const body = readFileSync(file ?? join(dist, '404.html'));
  res.writeHead(status, { ...HEADERS, 'Content-Type': TYPES[extname(file ?? '.html')] ?? 'application/octet-stream' });
  res.end(body);
});
await new Promise(r => server.listen(0, '127.0.0.1', r));
const origin = `http://127.0.0.1:${server.address().port}`;

const browser = await chromium.launch(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {});
let failures = 0;
let warnings = 0;

for (const size of SIZES) {
  for (const scheme of SCHEMES) {
    const { name: sizeName, ...options } = size;
    const context = await browser.newContext({ ...options, colorScheme: scheme, reducedMotion: 'reduce' });
    for (const p of PAGES) {
      const label = `${p.name} ${sizeName} ${scheme}`;
      const page = await context.newPage();
      const problems = [];
      page.on('console', m => {
        if (m.type() === 'error') problems.push(`console error: ${m.text()}`);
      });
      page.on('pageerror', e => problems.push(`uncaught: ${e.message}`));
      await page.route('**/*', route => {
        const url = new URL(route.request().url());
        if (url.origin === origin || url.protocol === 'data:') return route.continue();
        problems.push(`request to another host: ${url.href}`);
        return route.abort();
      });
      await page.addInitScript(() => {
        document.addEventListener('securitypolicyviolation', e => {
          console.error(`CSP violation: ${e.violatedDirective} ${e.blockedURI}`);
        });
      });

      const response = await page.goto(origin + p.path, { waitUntil: 'networkidle' });
      if (response?.status() !== 200) problems.push(`status ${response?.status()}`);
      await page.locator(p.ready).first().waitFor({ timeout: 15000 });
      await page.waitForTimeout(300);

      const results = await new AxeBuilder({ page }).withTags(TAGS).analyze();
      for (const v of results.violations) {
        const where = v.nodes.slice(0, 3).map(n => n.target.join(' ')).join('; ');
        const line = `${v.impact} ${v.id}: ${v.help} (${v.nodes.length}: ${where})`;
        if (FAIL_ON.has(v.impact)) problems.push(line);
        else {
          warnings++;
          console.log(`  note  ${label}: ${line}`);
        }
      }
      problems.push(
        ...(await page.evaluate(() => {
          const found = [];
          const dialog = document.querySelector('[role="dialog"]');
          if (dialog) {
            const awake = [...document.getElementById('root').children].filter(el => !el.contains(dialog) && !el.inert);
            if (awake.length) found.push(`not inert behind the dialog: ${awake.map(el => el.tagName.toLowerCase()).join(', ')}`);
          }
          const frame = document.getElementById('map-frame');
          if (frame && !dialog) {
            const tiny = [...frame.querySelectorAll('path[tabindex="0"]')].filter(el => {
              const r = el.getBoundingClientRect();
              return Math.max(r.width, r.height) < 2;
            });
            if (tiny.length) found.push(`Tab stops too small to see on the map: ${tiny.map(el => el.getAttribute('aria-label')?.split(':')[0]).join(', ')}`);
            const weights = document.getElementById('weights');
            if (weights && !(frame.compareDocumentPosition(weights) & Node.DOCUMENT_POSITION_FOLLOWING)) found.push('the weights come before the map in the page');
          }
          return found;
        })),
      );
      if (shots) await page.screenshot({ path: join(shots, `${p.name}-${sizeName}-${scheme}.png`) });

      if (problems.length) {
        failures += problems.length;
        console.log(`FAIL  ${label}`);
        for (const line of problems) console.log(`      ${line}`);
      } else console.log(`ok    ${label}`);
      await page.close();
    }
    await context.close();
  }
}

await browser.close();
server.close();
console.log(
  failures
    ? `\na11y: ${failures} problem(s) to fix`
    : `\na11y: no serious or critical problems, no console errors, no CSP violations, no other hosts (${warnings} lesser note(s))`,
);
process.exit(failures ? 1 : 0);
