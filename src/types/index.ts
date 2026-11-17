export type MacroCategory = 
  | 'safety'
  | 'governance'
  | 'rights'
  | 'economy'
  | 'health'
  | 'infrastructure'
  | 'climate'
  | 'environment';

export type SpectrumTier = 1 | 2 | 3 | 4;

export interface IndicatorMeta {
  id: string;
  name: string;
  shortName: string;
  category: MacroCategory;
  source: string;
  unit: string;
  description: string;
  tier: SpectrumTier;
  tierLabel: string;
  inverted: boolean;
  sourceUrl?: string;
  coverage?: number;
  goalposts?: [number, number];
}

export interface IndicatorScore {
  raw: number;
  formatted: string;
  score: number; // 0 to 100, normalised
  rank?: number;
  total?: number;
}

export interface StandoutFact {
  indicatorId: string;
  indicatorName: string;
  score: number;
  rank?: number;
  totalCountries?: number;
  badgeText: string;
  /** Share of the overall score this indicator carries under the active weights (0 to 1). */
  share?: number;
  explanation: string;
}

export interface CountryData {
  iso3: string;
  numeric: string;
  name: string;
  region: string;
  hasData?: boolean;
  coverage?: string;
  isDependency?: boolean;
  parentIso?: string;
  parentName?: string;
  dimensions: Record<MacroCategory, number | null>; // 0 to 100 dimension scores (null if no data)
  indicators: Record<string, IndicatorScore>;
  rawFacts: {
    note?: string;
    keyFacts?: { label: string; value: string }[];
  };

}

export interface MacroCategoryConfig {
  id: MacroCategory;
  name: string;
  description: string;
  indicators: string[]; // List of indicator IDs belonging to this category
}

export interface ComputedCountry extends CountryData {
  compositeScore: number | null;
  rank: number | null;
  percentile: number | null;
  activeStrengths: StandoutFact[];
  activeWeaknesses: StandoutFact[];
  indicatorRanks?: Record<string, { rank: number; total: number; percentile: number }>;
  dimensionRanks?: Record<MacroCategory, { rank: number; total: number; percentile: number }>;
}
