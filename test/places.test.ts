// Places the publishers report apart from the state that claims or governs them (docs/DECISIONS.md, decision 17)
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { countries, rank } from './helpers.ts';

test('Taiwan, Kosovo and Macao have their own figures, though too few to be ranked', () => {
  const r = rank();
  for (const [iso, n] of [['TWN', 12], ['XKX', 18], ['MAC', 11]] as const) {
    const c = countries[iso];
    assert.ok(!c.isDependency, iso);
    assert.equal(Object.keys(c.indicators).length, n, iso);
    assert.equal(c.coverage, `${n}/34`, iso);
    assert.ok(Object.values(c.indicators).every(v => v.rank == null && v.score != null), iso);
    assert.equal(r.byIso[iso].rank, null, iso);
    assert.ok(r.list.some(x => x.iso3 === iso), iso);
  }
  // Transparency International (KSV) and the ILO (KOS) code Kosovo differently from the site (XKX)
  assert.equal(countries.XKX.indicators.ti_cpi.raw, 43);
  assert.equal(countries.XKX.indicators.ilo_working_hours.raw, 42.25);
});

test('Hong Kong and Palestine are ranked', () => {
  const r = rank();
  for (const iso of ['HKG', 'PSE']) {
    assert.equal(countries[iso].hasData, true, iso);
    assert.ok(Object.keys(countries[iso].indicators).length >= 20, iso);
    assert.equal(typeof r.byIso[iso].rank, 'number', iso);
  }
});

test("every place's coverage counts the figures it shows", () => {
  for (const c of Object.values(countries)) {
    if (c.isDependency) continue;
    assert.equal(c.coverage, `${Object.keys(c.indicators).length}/34`, c.iso3);
  }
});
