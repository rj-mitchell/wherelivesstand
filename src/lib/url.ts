// What the address bar holds, and how it is read and written. The scheme is documented in
// docs/URLS.md; keep the two in step. Pure functions: the app calls them on every navigation, and the
// tests and build script use them too.
//
//   /                          the map and the rankings
//   /country/NOR               the same, with Norway's dossier open (ISO 3166-1 alpha-3, upper case)
//   /compare?a=ESP&b=NOR       the same, with the comparison open
//   /behind-the-rankings       the page on the limits of the indices
//   /about /method /privacy /terms /accessibility /corrections /press
//
// Any page may carry the weights and region as query parameters:
//   ?preset=young-family       a preset's weights, or
//   ?w=80-50-50-50-100-50-50-50  the eight dial values, in the dial order (scoring.ts CATEGORY_ORDER)
//   &fine=who_pm25:80,yale_epi:0  per-indicator weights that differ from 50 (present = fine-tuning on)
//   &region=europe             zoom the map and rank within a region
//   &scale=world               in a region, colour on the world scale rather than the region's own
//
// Old and short forms that are read but rewritten to the canonical form:
//   /?country=NOR -> /country/NOR, lower-case codes -> upper case, ?preset=balanced -> no parameter.
// A territory's code is not known: its link goes to the country it belongs to (dist/_redirects).

import type { MacroCategory } from '../types/index.ts';
import { CATEGORY_ORDER, DEFAULT_WEIGHT, defaultMacroWeights } from './scoring.ts';
import { presetById, matchingPreset } from '../data/presets.ts';
import { regionById, type RegionId } from '../data/regions.ts';

export const PAGES = ['behind-the-rankings', 'about', 'method', 'privacy', 'terms', 'accessibility', 'corrections', 'press'] as const;
export type Page = (typeof PAGES)[number];
export type View = 'map' | Page | 'not-found';

export interface UrlState {
  view: View;
  /** ISO3 of the open dossier, on the map view. */
  country: string | null;
  /** The two countries compared, when the comparison is open. */
  compare: [string, string] | null;
  macro: Record<MacroCategory, number>;
  fine: boolean;
  /** Per-indicator weights; only values other than 50 need to be present. */
  sub: Record<string, number>;
  region: RegionId;
  /** In a region, colour countries relative to the region (true) or on the world scale (false). */
  relative: boolean;
}

export function defaultUrlState(): UrlState {
  return {
    view: 'map',
    country: null,
    compare: null,
    macro: defaultMacroWeights(),
    fine: false,
    sub: {},
    region: 'global',
    relative: true,
  };
}

const ISO3 = /^[A-Za-z]{3}$/;
const clampWeight = (n: number) => Math.max(0, Math.min(100, Math.round(n)));

function parseWeights(params: URLSearchParams): Record<MacroCategory, number> | null {
  const preset = params.get('preset');
  if (preset) {
    const p = presetById(preset);
    if (p) return { ...p.weights };
  }
  const w = params.get('w');
  if (w) {
    const parts = w.split(/[-.,]/).map(Number);
    if (parts.length === CATEGORY_ORDER.length && parts.every(n => Number.isFinite(n))) {
      return Object.fromEntries(CATEGORY_ORDER.map((c, i) => [c, clampWeight(parts[i])])) as Record<MacroCategory, number>;
    }
  }
  return null;
}

function parseFine(value: string, indicatorIds?: Set<string>): Record<string, number> {
  const sub: Record<string, number> = {};
  for (const pair of value.split(',')) {
    const [id, v] = pair.split(':');
    const n = Number(v);
    if (!id || !Number.isFinite(n)) continue;
    if (indicatorIds && !indicatorIds.has(id)) continue;
    sub[id] = clampWeight(n);
  }
  return sub;
}

export interface ParseOptions {
  /** Country codes the data knows; others are dropped (and the dossier stays closed). */
  knownIso?: Set<string>;
  indicatorIds?: Set<string>;
}

/** Reads a location into app state. `canonical` is set when the address should be rewritten. */
export function parseUrl(pathname: string, search: string, opts: ParseOptions = {}): UrlState & { canonical: string | null } {
  const state = defaultUrlState();
  const params = new URLSearchParams(search);
  const known = (iso: string | null | undefined) =>
    iso && ISO3.test(iso) && (!opts.knownIso || opts.knownIso.has(iso.toUpperCase())) ? iso.toUpperCase() : null;

  const path = pathname.replace(/\/+$/, '') || '/';
  const segments = path.split('/').filter(Boolean);

  if (segments.length === 0) {
    state.view = 'map';
    state.country = known(params.get('country'));
  } else if (segments[0] === 'country' && segments.length === 2) {
    // A code the data does not know is a page that does not exist
    state.country = known(segments[1]);
    state.view = state.country ? 'map' : 'not-found';
  } else if (segments[0] === 'compare' && segments.length === 1) {
    state.view = 'map';
    const a = known(params.get('a'));
    const b = known(params.get('b'));
    state.compare = [a ?? 'GBR', b && b !== (a ?? 'GBR') ? b : a === 'FRA' ? 'DEU' : 'FRA'];
  } else if (segments.length === 1 && (PAGES as readonly string[]).includes(segments[0])) {
    state.view = segments[0] as Page;
  } else {
    state.view = 'not-found';
  }

  const macro = parseWeights(params);
  if (macro) state.macro = macro;
  if (params.has('fine')) {
    state.fine = true;
    state.sub = parseFine(params.get('fine') ?? '', opts.indicatorIds);
  }
  const region = regionById(params.get('region') ?? '');
  if (region) state.region = region.id;
  state.relative = params.get('scale') !== 'world';

  const canonical = state.view === 'not-found' ? null : buildUrl(state);
  const current = pathname + (search && search !== '?' ? (search.startsWith('?') ? search : `?${search}`) : '');
  return { ...state, canonical: canonical !== null && canonical !== current ? canonical : null };
}

/** The query string for the weights and region, in canonical order; empty when all are defaults. */
export function buildQuery(state: Pick<UrlState, 'macro' | 'fine' | 'sub' | 'region' | 'relative'>): string {
  const parts: string[] = [];
  const preset = matchingPreset(state.macro);
  if (preset && preset.id !== 'balanced') parts.push(`preset=${preset.id}`);
  else if (!preset) parts.push(`w=${CATEGORY_ORDER.map(c => state.macro[c] ?? DEFAULT_WEIGHT).join('-')}`);
  if (state.fine) {
    const changed = Object.entries(state.sub)
      .filter(([, v]) => v !== DEFAULT_WEIGHT)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([id, v]) => `${id}:${v}`);
    parts.push(`fine=${changed.join(',')}`);
  }
  if (state.region !== 'global') {
    parts.push(`region=${state.region}`);
    if (!state.relative) parts.push('scale=world');
  }
  return parts.join('&');
}

/** The canonical address for a state. Weights and region are carried on the map views only. */
export function buildUrl(state: UrlState): string {
  let path: string;
  const extra: string[] = [];
  if (state.view !== 'map') {
    path = state.view === 'not-found' ? '/' : `/${state.view}`;
    return path;
  }
  if (state.compare) {
    path = '/compare';
    extra.push(`a=${state.compare[0]}`, `b=${state.compare[1]}`);
  } else if (state.country) {
    path = `/country/${state.country}`;
  } else {
    path = '/';
  }
  const query = [...extra, buildQuery(state)].filter(Boolean).join('&');
  return query ? `${path}?${query}` : path;
}

/** The address of a country's dossier, as other sites should link to it. */
export const countryPath = (iso3: string) => `/country/${iso3.toUpperCase()}`;
