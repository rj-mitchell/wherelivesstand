// The app: holds the view, the open dossier or comparison, the weights and the region, and keeps them
// in the address bar (src/lib/url.ts, docs/URLS.md) so that every view can be linked to and Back works.
import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import type { CountryData, IndicatorMeta, MacroCategory, MacroCategoryConfig } from './types';
import { computeRankings, defaultMacroWeights } from './lib/scoring';
import { parseUrl, buildUrl, type UrlState, type View } from './lib/url';
import { worldScale, regionScale } from './lib/colour';
import { isCountryInRegion, type RegionId } from './data/regions';
import { NavContext, type Navigate } from './lib/nav';
import { Masthead } from './components/Masthead';
import { SiteFooter } from './components/SiteFooter';
import { WeightsPanel } from './components/WeightsPanel';
import { WorldMap } from './components/WorldMap';
import { RankingsTable } from './components/RankingsTable';
import { CountryDossier } from './components/CountryDossier';
import { CompareDialog } from './components/CompareDialog';
import { BehindTheRankings } from './pages/BehindTheRankings';
import { About, Method, Privacy, Terms, Accessibility, Corrections, Press, NotFound } from './pages/StandardPages';
import { DATA_UPDATED, formatDate, SITE_NAME, TAGLINE } from './config';
import rawIndicators from './data/indicators.json';
import rawCategories from './data/categories.json';

const indicators = rawIndicators as unknown as IndicatorMeta[];
const categories = rawCategories as unknown as MacroCategoryConfig[];

const PAGE_TITLES: Record<Exclude<View, 'map'>, string> = {
  'behind-the-rankings': 'Behind the rankings',
  about: 'About',
  method: 'How it works',
  privacy: 'Privacy',
  terms: 'Terms of use',
  accessibility: 'Accessibility statement',
  corrections: 'Corrections and problems',
  press: 'Press and citing',
  'not-found': 'Page not found',
};

export default function App({ countries }: { countries: Record<string, CountryData> }) {
  const parseOpts = useMemo(
    () => ({ knownIso: new Set(Object.values(countries).filter(c => !c.isDependency).map(c => c.iso3)), indicatorIds: new Set(indicators.map(i => i.id)) }),
    [countries],
  );
  const read = useCallback(() => parseUrl(window.location.pathname, window.location.search, parseOpts), [parseOpts]);

  const [s, setS] = useState<UrlState>(() => {
    const first = read();
    if (first.canonical) history.replaceState(history.state, '', first.canonical + window.location.hash);
    return first;
  });

  // Apply an address: the weights and region come from it only on the map views, so visiting a text page
  // and coming back keeps them.
  const apply = useCallback((next: UrlState) => {
    setS(prev => (next.view === 'map' ? next : { ...prev, view: next.view, country: null, compare: null }));
  }, []);

  const navigate: Navigate = useCallback(
    (href, opts = {}) => {
      const url = new URL(href, window.location.origin);
      if (url.origin !== window.location.origin) {
        window.location.assign(href);
        return;
      }
      const next = parseUrl(url.pathname, url.search, parseOpts);
      const target = (next.canonical ?? url.pathname + url.search) + url.hash;
      const overlay = next.view === 'map' && Boolean(next.country || next.compare);
      // `pushed`: this entry was added by the app, so closing a dialog can go Back to the one before it
      if (opts.replace) history.replaceState({ overlay, pushed: Boolean(history.state?.pushed) }, '', target);
      else history.pushState({ overlay, pushed: true }, '', target);
      const prevView = s.view;
      apply(next);
      if (next.view !== prevView || (!overlay && next.view !== 'map')) {
        if (url.hash) requestAnimationFrame(() => document.querySelector(url.hash)?.scrollIntoView());
        else window.scrollTo(0, 0);
        requestAnimationFrame(() => document.getElementById(next.view === 'map' ? 'map-title' : 'page-title')?.focus({ preventScroll: true }));
      }
    },
    [apply, parseOpts, s.view],
  );

  useEffect(() => {
    const onPop = () => apply(read());
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, [apply, read]);

  // Keep the address in step with the weights and region, without adding history entries for each slider move
  const lastWritten = useRef('');
  useEffect(() => {
    if (s.view !== 'map') return;
    const target = buildUrl(s);
    const current = window.location.pathname + window.location.search;
    if (target === current || target === lastWritten.current) return;
    const t = window.setTimeout(() => {
      lastWritten.current = target;
      history.replaceState(history.state, '', target + window.location.hash);
    }, 200);
    return () => window.clearTimeout(t);
  }, [s]);

  const weights = useMemo(() => ({ macro: s.macro, sub: s.sub, fine: s.fine }), [s.macro, s.sub, s.fine]);
  const rankings = useMemo(() => computeRankings(countries, indicators, weights), [countries, weights]);
  const { byIso, list, rankedCount } = rankings;

  const regionRanked = useMemo(() => list.filter(c => c.rank != null && isCountryInRegion(c, s.region)), [list, s.region]);
  const regionRanks = useMemo(() => Object.fromEntries(regionRanked.map((c, i) => [c.iso3, i + 1])), [regionRanked]);
  const scale = useMemo(
    () => (s.region !== 'global' && s.relative ? regionScale(regionRanked.map(c => c.compositeScore as number)) : worldScale()),
    [s.region, s.relative, regionRanked],
  );

  const mapState = { ...s, view: 'map' as const, country: null, compare: null };
  const mapHref = buildUrl(mapState);
  const hrefFor = (iso3: string) => buildUrl({ ...mapState, country: iso3 });
  const otherThan = (iso3: string) => (list[0]?.iso3 !== iso3 ? list[0]?.iso3 : list[1]?.iso3) ?? 'NOR';
  const compareHref = (a?: string | null) => {
    const first = a ?? s.country ?? 'GBR';
    return buildUrl({ ...mapState, compare: [first, otherThan(first)] });
  };

  const closeOverlay = () => {
    if (history.state?.overlay && history.state?.pushed) history.back();
    else navigate(mapHref, { replace: true });
  };

  const country = s.view === 'map' && s.country ? byIso[s.country] : null;
  const compare = s.view === 'map' && s.compare ? [byIso[s.compare[0]], byIso[s.compare[1]]] : null;

  useEffect(() => {
    const page = s.view !== 'map' ? PAGE_TITLES[s.view] : compare ? `${compare[0]?.name} and ${compare[1]?.name} compared` : country ? country.name : null;
    document.title = page ? `${page}: ${SITE_NAME}` : `${SITE_NAME}: ${TAGLINE.toLowerCase()}`;
  }, [s.view, country, compare]);

  const update = (patch: Partial<UrlState>) => setS(prev => ({ ...prev, ...patch }));
  const setRegion = (region: RegionId) => update({ region, relative: true });

  const [copied, setCopied] = useState(false);
  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 3000);
    } catch {
      setCopied(false);
    }
  };

  const countriesWithData = list.filter(c => c.hasData !== false);

  // Beside the map (at desktop widths), the weights panel reaches down to the map's foot, so the two line up;
  // never shorter than its own content, which then scrolls inside it if the window is too short
  const panelRef = useRef<HTMLDivElement>(null);
  const [panelHeight, setPanelHeight] = useState<number | null>(null);
  useLayoutEffect(() => {
    if (s.view !== 'map') return;
    const measure = () => {
      const panel = panelRef.current;
      const frame = document.getElementById('map-frame');
      if (!panel || !frame || !window.matchMedia('(min-width: 1024px)').matches) return setPanelHeight(null);
      const height = Math.round(frame.getBoundingClientRect().bottom - panel.getBoundingClientRect().top);
      setPanelHeight(prev => (prev === height ? prev : height > 0 ? height : null));
    };
    measure();
    const frame = document.getElementById('map-frame');
    const ro = typeof ResizeObserver !== 'undefined' && frame ? new ResizeObserver(measure) : null;
    if (ro && frame) ro.observe(frame);
    window.addEventListener('resize', measure);
    return () => {
      ro?.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, [s.view]);

  return (
    <NavContext.Provider value={navigate}>
      <a href="#main" className="skip-link">
        Skip to main content
      </a>
      <Masthead
        view={s.view}
        compareOpen={Boolean(compare)}
        mapHref={mapHref}
        compareHref={compareHref()}
        countries={countriesWithData}
        onSelectCountry={iso => navigate(hrefFor(iso))}
      />
      <main id="main" tabIndex={-1} className="outline-none">
        {s.view === 'map' && (
          <div className="max-w-page mx-auto px-4 md:px-8 pt-3 md:pt-4">
            {/* The map comes first (docs/DECISIONS.md, 6): the page's heading is for screen readers and the outline */}
            <h1 id="map-title" tabIndex={-1} className="visually-hidden">
              {TAGLINE}: the map and rankings
            </h1>
            {/* The map comes first in the page, as on screen on a phone; at desktop widths the grid puts the weights to
                its left (docs/DECISIONS.md, 6) */}
            <div className="grid lg:grid-cols-[minmax(17rem,22rem)_1fr] gap-x-10 gap-y-8 items-start">
              <div className="lg:col-start-2 lg:row-start-1 min-w-0">
                <h2 className="visually-hidden">Map</h2>
                <WorldMap
                  byIso={byIso}
                  rankedCount={rankedCount}
                  scale={scale}
                  region={s.region}
                  relative={s.relative}
                  regionRanks={regionRanks}
                  selectedIso={country?.iso3 ?? null}
                  onSelect={iso => navigate(hrefFor(iso))}
                  onRegion={setRegion}
                  onRelative={relative => update({ relative })}
                />
                <p className="text-sm text-muted mt-2 flex flex-wrap gap-x-3 gap-y-1 items-center">
                  <span>
                    {rankedCount} countries scored on {indicators.length} published indicators. Data last updated{' '}
                    {formatDate(DATA_UPDATED)}.
                  </span>
                  <button type="button" onClick={copyLink} className="min-h-6 text-heather underline underline-offset-2 hover:text-ink active:decoration-2 cursor-pointer no-print">
                    Copy a link to this view
                  </button>
                  <span role="status" className="text-ink">{copied ? 'Link copied.' : ''}</span>
                </p>
                <div className="mt-12">
                  <RankingsTable list={list} categories={categories} region={s.region} onRegion={setRegion} hrefFor={hrefFor} selectedIso={country?.iso3 ?? null} />
                </div>
              </div>
              <div
                ref={panelRef}
                style={panelHeight ? { minHeight: panelHeight } : undefined}
                // Beside the map it scrolls if the window is short, so it is padded (and pulled back by as much) to
                // leave room for a focused control's ring, which the scrolling would otherwise cut off
                className="lg:col-start-1 lg:row-start-1 lg:sticky lg:top-4 lg:max-h-[calc(100vh-2rem)] lg:overflow-y-auto lg:pr-2 lg:pl-3 lg:-ml-3 lg:pt-1.5 lg:-mt-1.5 flex flex-col"
              >
                <WeightsPanel
                  categories={categories}
                  indicators={indicators}
                  macro={s.macro}
                  sub={s.sub}
                  onMacro={(cat: MacroCategory, v: number) => update({ macro: { ...s.macro, [cat]: v } })}
                  onPreset={macro => update({ macro })}
                  onSub={(id, v) => update({ sub: { ...s.sub, [id]: v }, fine: true })}
                  onReset={() => update({ macro: defaultMacroWeights(), sub: {}, fine: false })}
                />
              </div>
            </div>
          </div>
        )}
        {s.view === 'behind-the-rankings' && <BehindTheRankings categories={categories} indicators={indicators} hrefFor={hrefFor} mapHref={mapHref} />}
        {s.view === 'about' && <About rankedCount={rankedCount} indicatorCount={indicators.length} />}
        {s.view === 'method' && <Method />}
        {s.view === 'privacy' && <Privacy />}
        {s.view === 'terms' && <Terms />}
        {s.view === 'accessibility' && <Accessibility />}
        {s.view === 'corrections' && <Corrections />}
        {s.view === 'press' && <Press rankedCount={rankedCount} indicatorCount={indicators.length} />}
        {s.view === 'not-found' && <NotFound mapHref={mapHref} />}
      </main>
      <SiteFooter />

      {country && (
        <CountryDossier
          key={country.iso3}
          country={country}
          rankedCount={rankedCount}
          categories={categories}
          indicators={indicators}
          macro={s.macro}
          compareHref={compareHref(country.iso3)}
          onClose={closeOverlay}
        />
      )}
      {compare && compare[0] && compare[1] && (
        <CompareDialog
          a={compare[0]}
          b={compare[1]}
          choices={countriesWithData}
          categories={categories}
          indicators={indicators}
          onChange={(a, b) => navigate(buildUrl({ ...mapState, compare: [a, b] }), { replace: true })}
          onClose={closeOverlay}
        />
      )}
    </NavContext.Provider>
  );
}
