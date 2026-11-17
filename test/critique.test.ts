// The "Behind the rankings" page quotes ranks, scores and correlations by hand
// (src/data/indexBiases.ts). Each test recomputes one figure from the data the site uses and checks
// that the page still quotes it, so a data refresh that moves a figure fails here instead of
// leaving the page wrong. When one fails, correct the text in indexBiases.ts and the number here.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { countries, indicators, rank, correlation } from './helpers.ts';
import { ordinal } from '../src/lib/scoring.ts';
import { MACRO_THEMES, INDICATOR_CRITIQUES, COUNTRY_ANOMALIES } from '../src/data/indexBiases.ts';

const allText = JSON.stringify([MACRO_THEMES, INDICATOR_CRITIQUES, COUNTRY_ANOMALIES]);
const quoted = (s: string) => assert.ok(allText.includes(s), `the page no longer says "${s}"`);
const base = rank();
const ranked = base.list.filter(c => c.rank != null);
const ind = (iso: string, id: string) => {
  const v = countries[iso].indicators[id];
  assert.ok(v, `${iso} has no ${id}`);
  return v;
};
const indRank = (iso: string, id: string) => `${ordinal(ind(iso, id).rank!)} of ${ind(iso, id).total}`;
const dimRank = (iso: string, cat: 'climate' | 'safety') => {
  const d = base.byIso[iso].dimensionRanks![cat];
  return `${ordinal(d.rank)} of ${d.total}`;
};
const r1 = (n: number) => Math.round(n * 10) / 10;
const r2 = (n: number) => n.toFixed(2).replace('-', '−');

test('every dial at 50%: Denmark first, just ahead of Switzerland', () => {
  assert.equal(base.list[0].iso3, 'DNK');
  assert.equal(base.list[1].iso3, 'CHE');
  quoted('With every dial at 50%, Denmark comes first, just ahead of Switzerland');
});

test('weather and climate at 100%: Australia first', () => {
  const w = rank({ climate: 100 });
  assert.equal(w.list[0].iso3, 'AUS');
  quoted('Turn weather and climate up to 100% and Australia does');
});

test('any other single dial at 100%: Switzerland or Denmark first', () => {
  for (const cat of ['safety', 'governance', 'rights', 'economy', 'health', 'infrastructure', 'environment'] as const) {
    assert.ok(['CHE', 'DNK'].includes(rank({ [cat]: 100 }).list[0].iso3), cat);
  }
  quoted('Raise any other single dial to 100% and Switzerland or Denmark still comes first');
});

test('correlations of GDP per capita with the dimensions', () => {
  const gdp = (c: (typeof ranked)[number]) => c.indicators.gdp_per_capita_ppp?.score;
  const corr = (cat: 'health' | 'infrastructure' | 'governance' | 'climate') =>
    r2(correlation(ranked.map(c => [gdp(c), c.dimensions[cat]])));
  assert.equal(corr('health'), '0.92');
  assert.equal(corr('infrastructure'), '0.88');
  assert.equal(corr('governance'), '0.78');
  assert.equal(corr('climate'), '−0.16');
  quoted('health dimension is 0.92, infrastructure 0.88 and governance 0.78');
  quoted('Weather is the exception (−0.16)');
});

test('expert scores overlap: CPI and WGI', () => {
  const s = (id: string) => (c: (typeof ranked)[number]) => c.indicators[id]?.score;
  const pair = (a: string, b: string) => r2(correlation(ranked.map(c => [s(a)(c), s(b)(c)])));
  assert.equal(pair('ti_cpi', 'wgi_rule_of_law'), '0.93');
  assert.equal(pair('wgi_gov_effectiveness', 'wgi_rule_of_law'), '0.93');
  quoted('Corruption Perceptions and WGI Rule of Law correlate at 0.93');
  quoted('correlates 0.93 with both');
});

test('kinds of indicator: 15 measured, 10 expert, of 34', () => {
  assert.equal(indicators.length, 34);
  assert.equal(indicators.filter(i => i.tier === 1).length, 15);
  assert.equal(indicators.filter(i => i.tier === 3).length, 10);
  quoted('15 of the 34 indicators are measured counts or rates');
  quoted('Ten are expert assessments');
});

test('a country needs 20 of 34 indicators to be ranked', () => {
  const counts = ranked.map(c => Object.values(c.indicators).filter(v => v && v.score != null).length);
  assert.equal(Math.min(...counts), 20);
  quoted('A country needs 20 of 34 indicators to be ranked');
  for (const iso of ['TWN', 'XKX']) assert.equal(base.byIso[iso].rank, null, iso);
});

test('coverage counts quoted for single indicators', () => {
  const covered = (id: string) => ranked.filter(c => c.indicators[id]?.score != null).length;
  assert.equal(covered('unodc_homicide'), 148);
  quoted('only 148 ranked countries have a figure from 2015 or later');
  assert.equal(covered('safe_drinking_water'), 134);
  quoted('Only 134 ranked countries report it');
  const coverage = (id: string) => indicators.find(i => i.id === id)?.coverage;
  assert.equal(coverage('atlas_economic_complexity'), 144);
  quoted('Covers just 144 countries');
  assert.equal(coverage('academic_freedom'), 174);
  quoted('Covers 174 countries');
  assert.equal(coverage('lgbtq_equality'), 184);
  quoted('covers 184 countries');
  assert.equal(coverage('nd_gain_resilience'), 183);
  quoted('Covers 183 countries');
});

test('single-indicator ranks quoted in the index notes', () => {
  assert.equal(indRank('USA', 'global_peace_index'), '132nd of 161');
  quoted('the US ranks 132nd of 161');
  assert.equal(indRank('GBR', 'organized_crime_index'), '124th of 184');
  quoted('the UK ranks 124th of 184');
  assert.equal(indRank('JPN', 'world_risk_index'), '166th of 184');
  quoted('Japan 166th of 184');
  assert.equal(ind('GBR', 'organized_crime_resilience').rank, 10);
  quoted('the UK ranks 124th for criminality but 10th for resilience');
  assert.equal(r1(ind('USA', 'who_uhc_coverage').raw), 88);
  assert.equal(r1(ind('GBR', 'who_uhc_coverage').raw), 88);
  quoted('the US scores 88, level with the UK');
});

test('Singapore', () => {
  assert.equal(indRank('SGP', 'wgi_gov_effectiveness'), '1st of 186');
  assert.equal(indRank('SGP', 'rsf_press_freedom'), '118th of 175');
  quoted('Government effectiveness: 1st of 186. Press freedom: 118th of 175.');
  assert.equal(ind('SGP', 'unodc_homicide').rank, 1);
  assert.equal(r1(ind('SGP', 'unodc_homicide').raw), 0.1);
  quoted('the lowest homicide rate in the data (0.1 per 100,000)');
  assert.equal(base.byIso.SGP.rank, 19);
  quoted('It ranks 19th overall at 50%');
  assert.equal(dimRank('SGP', 'climate'), '178th of 184');
  quoted('178th of 184 for weather');
});

test('United States', () => {
  assert.equal(indRank('USA', 'gdp_per_capita_ppp'), '9th of 181');
  assert.equal(indRank('USA', 'who_traffic_safety'), '142nd of 183');
  quoted('GDP per capita: 9th of 181. Road deaths: 142nd of 183.');
  assert.equal(ind('USA', 'ookla_broadband').rank, 6);
  quoted('broadband among the fastest anywhere (6th)');
  assert.equal(r1(ind('USA', 'who_traffic_safety').raw), 18.4);
  assert.equal(r1(ind('USA', 'unodc_homicide').raw), 5.8);
  assert.equal(r1(ind('USA', 'who_hale').raw), 64.6);
  assert.equal(ind('USA', 'who_hale').rank, 81);
  quoted('18.4 road deaths and 5.8 homicides per 100,000, and healthy life expectancy of 64.6 years (81st)');
  assert.equal(base.byIso.USA.rank, 35);
  quoted('35th overall at 50%');
});

test('Norway', () => {
  assert.equal(ind('NOR', 'rsf_press_freedom').rank, 1);
  assert.equal(ind('NOR', 'wgi_rule_of_law').rank, 3);
  assert.equal(indRank('NOR', 'climate_comfort'), '177th of 184');
  quoted('Press freedom: 1st. Rule of law: 3rd. Climate comfort: 177th of 184.');
  assert.equal(base.byIso.NOR.rank, 4);
  quoted('so it ranks 4th at 50%');
  const w = rank({ climate: 100 });
  for (const iso of ['AUS', 'NZL', 'ESP', 'PRT']) {
    assert.ok(base.byIso[iso].rank! > 4, `${iso} starts behind Norway`);
    assert.ok(w.byIso[iso].rank! < w.byIso.NOR.rank!, `${iso} moves ahead of Norway`);
  }
  quoted('Australia, New Zealand, Spain and Portugal move ahead of it');
});

test('Mexico', () => {
  assert.equal(indRank('MEX', 'climate_comfort'), '7th of 184');
  assert.equal(indRank('MEX', 'organized_crime_index'), '182nd of 184');
  quoted('Climate comfort: 7th of 184. Organised crime: 182nd of 184.');
  assert.equal(dimRank('MEX', 'climate'), '7th of 184');
  assert.equal(dimRank('MEX', 'safety'), '179th of 185');
  quoted('7th of 184 on the weather and climate dimension and 179th of 185 on safety and peace');
});

test('Japan', () => {
  assert.equal(ind('JPN', 'who_hale').rank, 2);
  assert.equal(r1(ind('JPN', 'who_hale').raw), 72.2);
  quoted('Healthy life expectancy: 2nd, at 72.2 years. WorldRiskIndex: 166th of 184.');
  assert.equal(base.byIso.JPN.rank, 14);
  quoted('Japan still ranks 14th overall');
});
