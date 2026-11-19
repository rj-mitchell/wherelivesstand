// Checks the built site in dist/ (run after `npm run build`, as `npm run test:build`): that each page's static HTML
// carries its heading and the figures the app works out for the balanced weights, and that it can be served under
// the content security policy.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { countries, indicators, rank } from '../helpers.ts';
import { ordinal } from '../../src/lib/scoring.ts';

const dist = new URL('../../dist/', import.meta.url);
if (!existsSync(new URL('index.html', dist))) throw new Error('dist/ is missing: run npm run build first');
const read = (path: string) => readFileSync(new URL(path, dist), 'utf8');

const unescape = (html: string) => html.replace(/&#x27;|&#39;/g, "'").replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
/** The text of some HTML, as a reader or a search engine without JavaScript gets it. */
const text = (html: string) =>
  unescape(html.replace(/<(script|style|noscript)[\s\S]*?<\/\1>/g, ' ').replace(/<[^>]+>/g, '')).replace(/\s+/g, ' ');
const h1s = (html: string) => [...html.matchAll(/<h1[^>]*>([\s\S]*?)<\/h1>/g)].map(m => text(m[1]).trim());
const meta = (html: string, name: string) => unescape(html.match(new RegExp(`<meta name="${name}" content="([^"]*)"`))?.[1] ?? '');

const balanced = rank();
const withPages = Object.values(countries).filter(c => !c.isDependency);
const TEXT_PAGES = ['about', 'method', 'privacy', 'terms', 'accessibility', 'corrections', 'press', 'behind-the-rankings'];

test('every country page has its name as its one h1, and the score and rank the app gives it', () => {
  assert.ok(withPages.length > 190);
  for (const c of withPages) {
    const html = read(`country/${c.iso3}.html`);
    assert.deepEqual(h1s(html), [`${c.name}: Quality of life`], c.iso3);
    const page = text(html);
    const computed = balanced.byIso[c.iso3];
    if (computed.rank != null) {
      const score = computed.compositeScore!.toFixed(1);
      assert.ok(page.includes(`Overall score${score} / 100`), `${c.iso3}: score ${score}`);
      assert.ok(page.includes(`Rank${computed.rank} of ${balanced.rankedCount}`), `${c.iso3}: rank ${computed.rank}`);
      assert.ok(page.includes('Under the balanced weights'), c.iso3);
      assert.ok(meta(html, 'description')!.startsWith(`${c.name}: ${score} out of 100 for quality of life, ${ordinal(computed.rank)} of ${balanced.rankedCount} countries`), c.iso3);
      for (const f of [...computed.activeStrengths, ...computed.activeWeaknesses]) assert.ok(page.includes(`${f.indicatorName}${f.badgeText}`), `${c.iso3}: ${f.indicatorName}`);
      // The countries either side of it in the rankings
      for (const r of [computed.rank - 1, computed.rank + 1]) {
        const n = balanced.list[r - 1];
        if (r >= 1 && n?.rank != null) assert.ok(unescape(html).includes(`href="/country/${n.iso3}">${n.name}</a>, ${ordinal(r)}`), `${c.iso3}: neighbour ${n.iso3}`);
      }
    } else {
      assert.ok(page.includes('Not ranked.'), c.iso3);
      assert.match(meta(html, 'description')!, new RegExp(`^${c.name} is not ranked`), c.iso3);
    }
    // Every indicator, with its value as published or "No figure"
    for (const ind of indicators) {
      const v = c.indicators[ind.id];
      assert.ok(page.includes(v ? v.formatted : 'No figure'), `${c.iso3}: ${ind.id}`);
    }
    assert.ok(html.includes('href="/method"'), c.iso3);
  }
});

test('a country page stays a reasonable size', () => {
  for (const c of withPages) assert.ok(read(`country/${c.iso3}.html`).length < 64_000, c.iso3);
});

test('the home page links to every country page, ranked in the table and the rest below it', () => {
  const html = read('index.html');
  assert.deepEqual(h1s(html), ['Quality of life, country by country: the map and rankings']);
  for (const c of withPages) assert.ok(html.includes(`href="/country/${c.iso3}"`), c.iso3);
  const first = balanced.list[0];
  assert.ok(text(html).includes(`1${first.name}${first.compositeScore!.toFixed(1)}`));
});

test('the text pages and the comparison carry their own text', () => {
  assert.deepEqual(h1s(read('about.html')), ['About Where Lives Stand']);
  assert.deepEqual(h1s(read('method.html')), ['Methodology']);
  assert.deepEqual(h1s(read('behind-the-rankings.html')), ['Behind the rankings']);
  assert.deepEqual(h1s(read('404.html')), ['Page not found']);
  assert.equal(h1s(read('compare.html')).length, 1);
  for (const page of [...TEXT_PAGES, 'index', 'compare', '404']) {
    const html = read(`${page}.html`);
    assert.ok(!html.includes('Loading the figures'), page);
    assert.match(html, /<div id="root" data-prerendered>/, page);
  }
});

test('no page has an inline style, which the content security policy would block', () => {
  for (const page of [...TEXT_PAGES, 'index', 'compare', '404', ...withPages.map(c => `country/${c.iso3}`)]) {
    assert.ok(!/<[^>]+\sstyle=/.test(read(`${page}.html`)), page);
  }
});

test('only the map views preload the figures and the map; every page preloads the typefaces', () => {
  const json = /<link rel="preload" href="\/assets\/(countries|world-50m)-[^"]+\.json"/g;
  for (const page of ['index', 'compare', 'country/GBR']) assert.equal(read(`${page}.html`).match(json)?.length, 2, page);
  for (const page of [...TEXT_PAGES, '404']) {
    const html = read(`${page}.html`);
    assert.equal(html.match(json), null, page);
    assert.equal(html.match(/<link rel="preload" href="\/family\/fonts\/[^"]+" as="font"/g)?.length, 2, page);
  }
});


test('the figures the browser loads are the dataset without its raw values', () => {
  const file = read('index.html').match(/\/assets\/(countries-[^"]+\.json)/)![1];
  const served = JSON.parse(read(`assets/${file}`));
  const expected = JSON.parse(JSON.stringify(countries, (k, v) => (k === 'raw' && typeof v === 'number' ? undefined : v)));
  assert.deepEqual(served, expected);
});
