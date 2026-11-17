// The picture mark (docs/DESIGN.md, "The mark"): the files in public/ are what scripts/mark.mjs draws, they
// stand alone, and the mark in the page (src/components/Mark.tsx) has the same shapes.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
// @ts-expect-error: a plain JavaScript module with no types
import { files } from '../scripts/mark.mjs';

const pub = (name: string) => readFileSync(new URL(`../public/${name}`, import.meta.url), 'utf8');
const drawn = files() as Record<string, string>;

test('the mark files are the ones scripts/mark.mjs draws (run it after changing the mark)', () => {
  for (const [name, text] of Object.entries(drawn)) assert.equal(pub(name), text, `public/${name}`);
});

test('each mark file is square and stands alone, with no links, scripts or text', () => {
  for (const name of Object.keys(drawn)) {
    const text = pub(name);
    assert.match(text, /viewBox="0 0 64 64"/, name);
    assert.doesNotMatch(text, /href|url\(|<script|<text|<image|<style/i, name);
  }
});

test('the mark in the page has the same shapes and colours as public/mark.svg', () => {
  const tsx = readFileSync(new URL('../src/components/Mark.tsx', import.meta.url), 'utf8');
  const svg = pub('mark.svg');
  for (const [, d] of svg.matchAll(/ d="([^"]+)"/g)) assert.ok(tsx.includes(`d="${d}"`), `path ${d.slice(0, 30)}...`);
  for (const [, colour] of svg.matchAll(/(?:fill|stroke)="(#[0-9A-F]{6})"/g)) assert.ok(tsx.includes(`"${colour}"`), colour);
});
