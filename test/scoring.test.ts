import { test } from 'node:test';
import assert from 'node:assert/strict';
import { countries, indicators, rank } from './helpers.ts';
import { CATEGORY_ORDER, indicatorShares, defaultWeights } from '../src/lib/scoring.ts';

const catOf = (id: string) => indicators.find(i => i.id === id)!.category;
const ids = (facts: { indicatorId: string }[]) => facts.map(f => f.indicatorId);

test('186 countries are ranked, best first, and unranked ones follow', () => {
  const r = rank();
  assert.equal(r.rankedCount, 186);
  assert.equal(r.list[0].rank, 1);
  const scores = r.list.filter(c => c.rank != null).map(c => c.compositeScore!);
  assert.deepEqual(scores, [...scores].sort((a, b) => b - a));
  assert.ok(r.list.slice(186).every(c => c.rank == null));
  assert.ok(r.list.every(c => !c.isDependency));
});

test('the dial order matches categories.json', async () => {
  const { categories } = await import('./helpers.ts');
  assert.deepEqual(categories.map(c => c.id), CATEGORY_ORDER);
});

test('indicator shares add up to the whole score', () => {
  const nor = countries.NOR;
  const w = defaultWeights();
  w.macro.climate = 100;
  w.macro.rights = 0;
  const shares = indicatorShares(nor, nor.dimensions, indicators, w);
  const total = Object.values(shares).reduce((a, b) => a + b, 0);
  assert.ok(Math.abs(total - 1) < 1e-9);
  assert.equal(shares.climate_comfort, 100 / 400);
  assert.ok(Object.entries(shares).every(([id, s]) => catOf(id) !== 'rights' || s === 0));
});

test('standouts follow the dials: a dimension at zero never appears', () => {
  for (const iso of ['NOR', 'USA', 'MEX', 'SGP', 'IND']) {
    const before = rank().byIso[iso];
    const facts = [...before.activeStrengths, ...before.activeWeaknesses];
    assert.ok(facts.length > 0, iso);
    // Turn off every dimension the current standouts come from
    const off = Object.fromEntries(facts.map(f => [catOf(f.indicatorId), 0]));
    const after = rank(off).byIso[iso];
    for (const f of [...after.activeStrengths, ...after.activeWeaknesses]) {
      assert.ok(!(catOf(f.indicatorId) in off), `${iso}: ${f.indicatorId} should be gone`);
    }
  }
});

test('standouts follow the dials: weather alone makes it Norway\'s weakness and Mexico\'s strength', () => {
  const only = Object.fromEntries(CATEGORY_ORDER.map(c => [c, c === 'climate' ? 100 : 5]));
  const r = rank(only);
  assert.equal(r.byIso.NOR.activeWeaknesses[0].indicatorId, 'climate_comfort');
  assert.equal(r.byIso.MEX.activeStrengths[0].indicatorId, 'climate_comfort');
  // With the default dials neither is the case for Norway's strengths, which are institutional
  assert.ok(!ids(rank().byIso.NOR.activeStrengths).includes('climate_comfort'));
});

test('per-indicator weights move the standouts too', () => {
  const sub = Object.fromEntries(indicators.map(i => [i.id, i.id === 'organized_crime_index' ? 100 : 50]));
  const mex = rank({}, sub).byIso.MEX;
  assert.equal(mex.activeWeaknesses[0].indicatorId, 'organized_crime_index');
  const subOff = { ...sub, organized_crime_index: 0 };
  assert.ok(!ids(rank({}, subOff).byIso.MEX.activeWeaknesses).includes('organized_crime_index'));
});

test('strengths rank above the middle, weaknesses below, and say how much they count', () => {
  for (const c of rank().list.filter(c => c.rank != null)) {
    for (const s of c.activeStrengths) assert.ok(s.rank! <= (s.totalCountries! + 1) / 2, `${c.iso3} ${s.indicatorId}`);
    for (const s of c.activeWeaknesses) assert.ok(s.rank! >= (s.totalCountries! + 1) / 2, `${c.iso3} ${s.indicatorId}`);
    for (const s of [...c.activeStrengths, ...c.activeWeaknesses]) assert.match(s.explanation, /Counts for \d+\.\d% of the overall score/);
  }
});

test('all dials at zero counts as all equal', () => {
  const zero = Object.fromEntries(CATEGORY_ORDER.map(c => [c, 0]));
  assert.deepEqual(rank(zero).list.slice(0, 10).map(c => c.iso3), rank().list.slice(0, 10).map(c => c.iso3));
});
