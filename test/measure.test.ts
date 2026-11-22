// The measurement switch (src/config.ts, ADS; docs/DECISIONS.md, 19): it ships off, and what the build does when it
// is on (scripts/measure.mjs). test/build/pages.test.ts checks the built site with it off.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { ADS, MEASURES, measureTag } from '../src/config.ts';
// @ts-expect-error: a plain JavaScript module with no types
import { draftProblems, measuredCsp, measuredHeaders, measureScript, withMeasure } from '../scripts/measure.mjs';

const read = (path: string) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
const KIT_CSP = JSON.parse(read('public/family/measure-csp.json')) as Record<string, string[] | string>;
const TAG = 'AW-123456789';

test('the switch ships off, with no tag', () => {
  assert.deepEqual(ADS, { measurement: false, tag: '' });
  assert.equal(measureTag(), '');
  assert.equal(measureTag({ measurement: true, tag: '' }), '', 'on without a tag is still off');
  assert.equal(measureTag({ measurement: true, tag: 'AW-1"><script>' }), '');
  assert.equal(measureTag({ measurement: false, tag: TAG }), '');
  assert.equal(measureTag({ measurement: true, tag: TAG }), TAG);
  assert.equal(MEASURES, 'source_opened donate_click');
});

test('off: the policy in public/_headers has no Google host, and no source file names measure.js but the build', () => {
  const headers = read('public/_headers');
  assert.match(headers, /Content-Security-Policy: default-src 'self'; img-src 'self' data:; base-uri 'none'; form-action 'self'; frame-ancestors 'none'\n/);
  assert.doesNotMatch(headers, /google|doubleclick/i);
  assert.doesNotMatch(read('index.html'), /measure\.js|googletagmanager/);
});

test('on: every page gets measure.js with the tag at the end of its head', () => {
  const page = '<html><head>\n    <title>x</title>\n  </head><body></body></html>';
  const on = withMeasure(page, TAG, MEASURES);
  assert.equal(
    on.split('</head>')[0].trim().split('\n').at(-1)!.trim(),
    `<script src="/family/measure.js" data-tag="${TAG}" data-privacy="/privacy" data-measures="source_opened donate_click" defer></script>`,
  );
  assert.equal(measureScript('AW-1"x', 'a'), '<script src="/family/measure.js" data-tag="AW-1&quot;x" data-privacy="/privacy" data-measures="a" defer></script>');
  assert.throws(() => withMeasure('<p>no head</p>', TAG, MEASURES));
});

test('on: the policy adds exactly the kit’s hosts for the Google tag, and nothing else changes', () => {
  const headers = read('public/_headers');
  const on: string = measuredHeaders(headers, KIT_CSP);
  const policy: string = on.match(/Content-Security-Policy: (.+)/)![1];
  const directives = Object.fromEntries(policy.split('; ').map(d => [d.split(' ')[0], d.split(' ').slice(1)]));
  assert.deepEqual(directives['script-src'], ["'self'", ...KIT_CSP['script-src']]);
  assert.deepEqual(directives['img-src'], ["'self'", 'data:', ...KIT_CSP['img-src']]);
  assert.deepEqual(directives['connect-src'], ["'self'", ...KIT_CSP['connect-src']]);
  assert.deepEqual(directives['frame-src'], ["'self'", ...KIT_CSP['frame-src']]);
  for (const d of ['default-src', 'base-uri', 'form-action', 'frame-ancestors']) assert.equal(directives[d].join(' '), headers.match(new RegExp(`${d} ([^;\\n]+)`))![1]);
  assert.doesNotMatch(policy, /unsafe|\*/);
  // every other line of the file is as it was
  assert.deepEqual(on.split('\n').filter(l => !l.includes('Content-Security-Policy')), headers.split('\n').filter(l => !l.includes('Content-Security-Policy')));
  assert.equal(measuredCsp("default-src 'self'", { 'script-src': ['https://a.example'] }), "default-src 'self'; script-src 'self' https://a.example");
});

test('on: the privacy notice must be finished before it is built, and says what it must', () => {
  const source = read('src/pages/StandardPages.tsx');
  const draft = source.slice(source.indexOf('const PRIVACY_MEASUREMENT_UPDATED'), source.indexOf('export const Terms'));
  assert.deepEqual(draftProblems(draft), ['it still says NNNNNNN for the charity number', 'its date still says draft']);
  assert.deepEqual(draftProblems('charity number 1234567. Last updated 1 March 2027.'), []);
  const words = draft.replace(/\s+/g, ' ');
  for (const phrase of [
    'id="measurement"', 'Google Ad Grants', 'open a publisher\'s source or follow the Donate link', 'independent controller',
    'The legal basis is your consent', '90 days', 'https://policies.google.com/technologies/retention',
    'https://business.safety.google/privacy/', '“Measurement choices”', 'Nothing is loaded from Google until you choose',
    'No ads are ever shown', 'nothing on them is personalised', 'registered in England and Wales (charity number',
  ]) assert.ok(words.includes(phrase), phrase);
});
