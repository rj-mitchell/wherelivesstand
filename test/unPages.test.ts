// The link from a place's page to its page on Where Countries Stand (docs/DECISIONS.md, 20)
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { UN_PAGES, unPageHref } from '../src/data/unPages.ts';

test('the UN record has a page for each Member State, the two observer States and Kosovo', () => {
  assert.equal(UN_PAGES.size, 196);
  for (const code of ['GBR', 'USA', 'CHN', 'PSE', 'VAT', 'XKX', 'TUV']) assert.ok(UN_PAGES.has(code), code);
});

test('a place with a page there links to it by its code in lower case', () => {
  assert.equal(unPageHref('ITA'), 'https://wherecountriesstand.com/countries/ita.html');
  assert.equal(unPageHref('PSE'), 'https://wherecountriesstand.com/countries/pse.html');
});

test('places the UN record does not treat as speakers have no link', () => {
  for (const code of ['TWN', 'HKG', 'MAC', 'ESH', 'COK', 'NIU', 'FRO', 'PRI']) assert.equal(unPageHref(code), null, code);
});
