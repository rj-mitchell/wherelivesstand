import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseUrl, buildUrl, defaultUrlState, countryPath } from '../src/lib/url.ts';
import { PRESETS } from '../src/data/presets.ts';
import { countries, indicators } from './helpers.ts';

const sovereign = Object.values(countries).filter(c => !c.isDependency).map(c => c.iso3);
const opts = { knownIso: new Set(sovereign), indicatorIds: new Set(indicators.map(i => i.id)) };
const parse = (url: string) => {
  const u = new URL(url, 'https://wherelivesstand.com');
  return parseUrl(u.pathname, u.search, opts);
};

test('the home page is the map with default weights', () => {
  const s = parse('/');
  assert.equal(s.view, 'map');
  assert.equal(s.country, null);
  assert.equal(s.canonical, null);
  assert.equal(buildUrl(defaultUrlState()), '/');
});

test('a country has its own address, and the short form is rewritten to it', () => {
  assert.equal(parse('/country/NOR').country, 'NOR');
  assert.equal(parse('/country/NOR').canonical, null);
  assert.equal(parse('/country/nor').canonical, '/country/NOR');
  assert.equal(parse('/?country=GBR').country, 'GBR');
  assert.equal(parse('/?country=GBR').canonical, '/country/GBR');
  assert.equal(parse('/country/NOR/').canonical, '/country/NOR');
  assert.equal(countryPath('gbr'), '/country/GBR');
});

test('an unknown country code is not found; in the short form it is ignored', () => {
  assert.equal(parse('/country/ZZZ').view, 'not-found');
  assert.equal(parse('/country/ZZZ').canonical, null);
  assert.equal(parse('/?country=ZZZ').country, null);
  assert.equal(parse('/?country=ZZZ').canonical, '/');
  assert.equal(parse('/country/FRO').view, 'not-found'); // a territory: the server redirects it to Denmark
});

test('every country in the data round-trips', () => {
  for (const iso of sovereign) {
    const s = parse(countryPath(iso));
    assert.equal(s.country, iso);
    assert.equal(buildUrl(s), `/country/${iso}`);
  }
});

test('presets are named; custom weights are listed in dial order', () => {
  for (const p of PRESETS) {
    const s = { ...defaultUrlState(), macro: { ...p.weights } };
    const url = buildUrl(s);
    assert.equal(url, p.id === 'balanced' ? '/' : `/?preset=${p.id}`);
    assert.deepEqual(parse(url).macro, p.weights);
  }
  const s = defaultUrlState();
  s.macro.climate = 100;
  s.macro.safety = 0;
  assert.equal(buildUrl(s), '/?w=0-50-50-50-50-50-100-50');
  assert.deepEqual(parse('/?w=0-50-50-50-50-50-100-50').macro, s.macro);
  assert.equal(parse('/?preset=balanced').canonical, '/');
});

test('bad weight lists are ignored and out-of-range values clamped', () => {
  assert.deepEqual(parse('/?w=1-2-3').macro, defaultUrlState().macro);
  assert.equal(parse('/?w=120-50-50-50-50-50-50-0').macro.safety, 100);
});

test('fine-tuning keeps only changed indicators, sorted, and drops unknown ones', () => {
  const s = defaultUrlState();
  s.fine = true;
  s.sub = { yale_epi: 0, who_pm25: 80, ti_cpi: 50 };
  const url = buildUrl(s);
  assert.equal(url, '/?fine=who_pm25:80,yale_epi:0');
  const back = parse(url);
  assert.equal(back.fine, true);
  assert.deepEqual(back.sub, { who_pm25: 80, yale_epi: 0 });
  assert.deepEqual(parse('/?fine=nonsense:10,who_pm25:20').sub, { who_pm25: 20 });
  assert.equal(parse('/?fine=').fine, true);
  // URL-encoded separators, as some apps rewrite them, read the same
  assert.deepEqual(parse('/?fine=who_pm25%3A80%2Cyale_epi%3A0').sub, { who_pm25: 80, yale_epi: 0 });
});

test('region and scale', () => {
  const s = parse('/country/FRA?preset=young-family&region=europe&scale=world');
  assert.equal(s.region, 'europe');
  assert.equal(s.relative, false);
  assert.equal(s.country, 'FRA');
  assert.equal(buildUrl(s), '/country/FRA?preset=young-family&region=europe&scale=world');
  assert.equal(parse('/?region=atlantis').region, 'global');
  // scale only means something inside a region
  assert.equal(parse('/?scale=world').canonical, '/');
});

test('the comparison', () => {
  const s = parse('/compare?a=esp&b=NOR');
  assert.deepEqual(s.compare, ['ESP', 'NOR']);
  assert.equal(s.canonical, '/compare?a=ESP&b=NOR');
  assert.deepEqual(parse('/compare').compare, ['GBR', 'FRA']);
  assert.deepEqual(parse('/compare?a=FRA&b=FRA').compare, ['FRA', 'DEU']);
});

test('pages, and everything else is not found', () => {
  for (const p of ['behind-the-rankings', 'about', 'method', 'privacy', 'terms', 'accessibility', 'corrections', 'press']) {
    assert.equal(parse(`/${p}`).view, p);
    assert.equal(buildUrl({ ...defaultUrlState(), view: p as never }), `/${p}`);
  }
  for (const p of ['/robots.txt.bak', '/country', '/country/NOR/extra', '/wp-admin', '/About']) {
    assert.equal(parse(p).view, 'not-found', p);
  }
});
