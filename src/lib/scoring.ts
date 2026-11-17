// The scoring model: turns the published indicator scores into each country's overall score and
// ranks under a set of weights. Pure functions with no browser or React code, so the app, the
// tests and the build scripts all use the same arithmetic.

import type {
  CountryData,
  ComputedCountry,
  IndicatorMeta,
  MacroCategory,
  StandoutFact,
} from '../types/index.ts';

/** The eight dimensions, in the order the dials appear on the page (and in shared links). */
export const CATEGORY_ORDER: MacroCategory[] = [
  'safety',
  'governance',
  'rights',
  'economy',
  'health',
  'infrastructure',
  'climate',
  'environment',
];

export const DEFAULT_WEIGHT = 50;

/** A dimension needs at least this share of its indicators, otherwise it is n/a (see scripts/build_dataset.py). */
export const MIN_DIM_SHARE = 0.5;

export interface Weights {
  /** 0 to 100 for each dimension. */
  macro: Record<MacroCategory, number>;
  /** 0 to 100 for each indicator; used only when `fine` is on. */
  sub: Record<string, number>;
  /** Whether the per-indicator weights are in use. */
  fine: boolean;
}

export function defaultMacroWeights(): Record<MacroCategory, number> {
  return Object.fromEntries(CATEGORY_ORDER.map(c => [c, DEFAULT_WEIGHT])) as Record<MacroCategory, number>;
}

export function defaultWeights(): Weights {
  return { macro: defaultMacroWeights(), sub: {}, fine: false };
}

const emptyDimensions = (): Record<MacroCategory, number | null> =>
  Object.fromEntries(CATEGORY_ORDER.map(c => [c, null])) as Record<MacroCategory, number | null>;

const round1 = (n: number) => Math.round(n * 10) / 10;

/** 1st, 2nd, 3rd, 4th, 11th, 21st: ranks as they are written in running text. */
export const ordinal = (n: number) => {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
};

/** How much one indicator counts towards one country's overall score under the given weights (0 to 1). */
export function indicatorShares(
  country: CountryData,
  dimensions: Record<MacroCategory, number | null>,
  indicators: IndicatorMeta[],
  weights: Weights,
): Record<string, number> {
  const totalMacro = CATEGORY_ORDER.reduce((s, c) => s + (weights.macro[c] ?? DEFAULT_WEIGHT), 0);
  // All dials at zero is treated as all equal, as the overall score does
  const macroW = (c: MacroCategory) => (totalMacro === 0 ? DEFAULT_WEIGHT : weights.macro[c] ?? DEFAULT_WEIGHT);
  const live = CATEGORY_ORDER.filter(c => dimensions[c] != null);
  const liveTotal = live.reduce((s, c) => s + macroW(c), 0);
  const shares: Record<string, number> = {};
  if (liveTotal === 0) return shares;
  for (const cat of live) {
    const inCat = indicators.filter(i => i.category === cat && country.indicators[i.id]?.score != null);
    const subW = (id: string) => (weights.fine ? weights.sub[id] ?? DEFAULT_WEIGHT : DEFAULT_WEIGHT);
    const subTotal = inCat.reduce((s, i) => s + subW(i.id), 0);
    for (const ind of inCat) {
      shares[ind.id] = subTotal > 0 ? (macroW(cat) / liveTotal) * (subW(ind.id) / subTotal) : 0;
    }
  }
  return shares;
}

/**
 * The indicators that lift a country's score most, and those that hold it back most, under the given
 * weights. Each indicator's standing is its global rank as a percentile (1 = best, 0 = worst); its pull
 * is that standing's distance from the middle, times the share of the overall score it carries. So an
 * indicator dialled to zero can never appear, and dialling one up brings it forward.
 */
export function standouts(
  country: CountryData,
  dimensions: Record<MacroCategory, number | null>,
  indicators: IndicatorMeta[],
  weights: Weights,
  ties: TieCounts = new Map(),
  count = 2,
): { strengths: StandoutFact[]; weaknesses: StandoutFact[] } {
  const shares = indicatorShares(country, dimensions, indicators, weights);
  const rows = indicators.flatMap(ind => {
    const v = country.indicators[ind.id];
    const share = shares[ind.id] ?? 0;
    if (!v || v.score == null || v.rank == null || !v.total || share <= 0) return [];
    // Countries sharing a rank stand at the middle of the places they share
    const shared = ties.get(`${ind.id}|${v.rank}`) ?? 1;
    const midRank = v.rank + (shared - 1) / 2;
    const standing = v.total > 1 ? 1 - (midRank - 1) / (v.total - 1) : 0.5;
    return [{ ind, v, share, shared, standing, pull: share * (standing - 0.5) }];
  });
  const fact = (r: (typeof rows)[number]): StandoutFact => ({
    indicatorId: r.ind.id,
    indicatorName: r.ind.shortName,
    score: r.v.score,
    rank: r.v.rank,
    totalCountries: r.v.total,
    share: r.share,
    badgeText: `${ordinal(r.v.rank!)} of ${r.v.total}${r.shared > 1 ? `, shared by ${r.shared}` : ''}`,
    explanation: `${r.v.formatted}. Counts for ${(r.share * 100).toFixed(1)}% of the overall score under these weights.`,
  });
  const strengths = rows.filter(r => r.pull > 0).sort((a, b) => b.pull - a.pull).slice(0, count).map(fact);
  const weaknesses = rows.filter(r => r.pull < 0).sort((a, b) => a.pull - b.pull).slice(0, count).map(fact);
  return { strengths, weaknesses };
}

/** How many countries share each rank on each indicator, keyed "indicatorId|rank". */
export type TieCounts = Map<string, number>;

export function tieCounts(countries: Record<string, CountryData>): TieCounts {
  const ties: TieCounts = new Map();
  for (const c of Object.values(countries)) {
    for (const [id, v] of Object.entries(c.indicators ?? {})) {
      if (v?.rank == null) continue;
      const k = `${id}|${v.rank}`;
      ties.set(k, (ties.get(k) ?? 0) + 1);
    }
  }
  return ties;
}

const tieCache = new WeakMap<object, TieCounts>();

/** Dimension scores for one country; per-indicator weights apply only where a dimension's weights differ. */
export function dimensionScores(
  country: CountryData,
  indicators: IndicatorMeta[],
  weights: Weights,
): Record<MacroCategory, number | null> {
  const dims = { ...country.dimensions };
  if (!weights.fine) return dims;
  for (const cat of CATEGORY_ORDER) {
    const inCat = indicators.filter(i => i.category === cat);
    if (inCat.length === 0) continue;
    const first = weights.sub[inCat[0].id] ?? DEFAULT_WEIGHT;
    if (inCat.every(i => (weights.sub[i.id] ?? DEFAULT_WEIGHT) === first)) continue;
    let sum = 0;
    let wsum = 0;
    let available = 0;
    for (const ind of inCat) {
      const sw = weights.sub[ind.id] ?? DEFAULT_WEIGHT;
      const v = country.indicators[ind.id];
      if (v && v.score != null) {
        sum += v.score * sw;
        wsum += sw;
        available++;
      }
    }
    if (available < MIN_DIM_SHARE * inCat.length) dims[cat] = null;
    else if (wsum > 0) dims[cat] = round1(sum / wsum);
  }
  return dims;
}

export interface Rankings {
  byIso: Record<string, ComputedCountry>;
  /** Ranked countries best first, then unranked countries (dependencies excluded). */
  list: ComputedCountry[];
  rankedCount: number;
}

/** Scores and ranks every country under the given weights. */
export function computeRankings(
  countries: Record<string, CountryData>,
  indicators: IndicatorMeta[],
  weights: Weights,
): Rankings {
  const totalMacro = CATEGORY_ORDER.reduce((s, c) => s + (weights.macro[c] ?? DEFAULT_WEIGHT), 0);
  const byIso: Record<string, ComputedCountry> = {};
  let ties = tieCache.get(countries);
  if (!ties) {
    ties = tieCounts(countries);
    tieCache.set(countries, ties);
  }

  for (const [iso3, country] of Object.entries(countries)) {
    if (country.hasData === false) {
      byIso[iso3] = {
        ...country,
        dimensions: emptyDimensions(),
        compositeScore: null,
        rank: null,
        percentile: null,
        activeStrengths: [],
        activeWeaknesses: [],
      };
      continue;
    }
    const dims = dimensionScores(country, indicators, weights);
    let sum = 0;
    let wsum = 0;
    for (const cat of CATEGORY_ORDER) {
      const s = dims[cat];
      if (s != null && !Number.isNaN(s)) {
        const w = totalMacro === 0 ? DEFAULT_WEIGHT : weights.macro[cat] ?? DEFAULT_WEIGHT;
        sum += s * w;
        wsum += w;
      }
    }
    const { strengths, weaknesses } = standouts(country, dims, indicators, weights, ties);
    byIso[iso3] = {
      ...country,
      dimensions: dims,
      compositeScore: wsum > 0 ? round1(sum / wsum) : null,
      rank: null,
      percentile: null,
      activeStrengths: strengths,
      activeWeaknesses: weaknesses,
    };
  }

  const all = Object.values(byIso).filter(c => !c.isDependency);
  const scored = all.filter(c => c.compositeScore != null && c.hasData !== false);
  const unscored = all.filter(c => c.compositeScore == null || c.hasData === false);
  scored.sort((a, b) => (b.compositeScore as number) - (a.compositeScore as number) || a.name.localeCompare(b.name));
  unscored.sort((a, b) => a.name.localeCompare(b.name));
  const n = scored.length;
  scored.forEach((c, i) => {
    c.rank = i + 1;
    c.percentile = Math.round(((n - i) / n) * 100);
  });

  // Rank within each dimension; equal scores share a rank
  for (const cat of CATEGORY_ORDER) {
    const withDim = scored.filter(c => c.dimensions[cat] != null).sort((a, b) => (b.dimensions[cat] as number) - (a.dimensions[cat] as number));
    const total = withDim.length;
    let prevScore: number | null = null;
    let prevRank = 0;
    withDim.forEach((c, i) => {
      const score = c.dimensions[cat] as number;
      const rank = prevScore === score ? prevRank : i + 1;
      prevScore = score;
      prevRank = rank;
      c.dimensionRanks = c.dimensionRanks ?? ({} as NonNullable<ComputedCountry['dimensionRanks']>);
      c.dimensionRanks[cat] = { rank, total, percentile: Math.round(((total - rank) / total) * 100) };
    });
  }

  return { byIso, list: [...scored, ...unscored], rankedCount: n };
}
