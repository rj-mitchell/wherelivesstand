// Loads the published dataset for tests, the same files the site serves.
import { readFileSync } from 'node:fs';
import type { CountryData, IndicatorMeta, MacroCategoryConfig } from '../src/types/index.ts';
import { computeRankings, defaultWeights, type Weights } from '../src/lib/scoring.ts';

const read = (name: string) => JSON.parse(readFileSync(new URL(`../src/data/${name}`, import.meta.url), 'utf8'));

export const countries = read('countries.json') as Record<string, CountryData>;
export const indicators = read('indicators.json') as IndicatorMeta[];
export const categories = read('categories.json') as MacroCategoryConfig[];

export function rank(overrides: Partial<Weights['macro']> = {}, fine?: Record<string, number>) {
  const w = defaultWeights();
  Object.assign(w.macro, overrides);
  if (fine) {
    w.fine = true;
    w.sub = fine;
  }
  return computeRankings(countries, indicators, w);
}

/** Pearson correlation over the countries that have both values. */
export function correlation(pairs: [number | null | undefined, number | null | undefined][]) {
  const xy = pairs.filter((p): p is [number, number] => p[0] != null && p[1] != null);
  const n = xy.length;
  const mx = xy.reduce((s, p) => s + p[0], 0) / n;
  const my = xy.reduce((s, p) => s + p[1], 0) / n;
  let sxy = 0, sxx = 0, syy = 0;
  for (const [x, y] of xy) {
    sxy += (x - mx) * (y - my);
    sxx += (x - mx) ** 2;
    syy += (y - my) ** 2;
  }
  return sxy / Math.sqrt(sxx * syy);
}
