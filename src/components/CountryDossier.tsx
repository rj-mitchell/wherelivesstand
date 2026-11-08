// A country's dossier: its score and rank under the current weights, what lifts and holds back that
// score, its eight dimensions, every indicator with its value, year, rank and publisher, and key facts.
import React, { useState } from 'react';
import type { ComputedCountry, IndicatorMeta, MacroCategory, MacroCategoryConfig } from '../types';
import { Dialog } from './Dialog';
import { Link } from '../lib/nav';
import { Spine } from './family/Spine';

interface Props {
  country: ComputedCountry;
  rankedCount: number;
  categories: MacroCategoryConfig[];
  indicators: IndicatorMeta[];
  macro: Record<MacroCategory, number>;
  compareHref: string;
  onClose: () => void;
}

const KINDS: Record<number, string> = {
  1: 'Measured counts and rates',
  2: 'Composite indices',
  3: 'Expert assessments',
  4: 'Derived from measurements',
};

const COUNTRIES_SITE = { url: 'https://wherecountriesstand.com', cloth: '#1F5F8B' };
// Until Where Countries Stand has a page for each country, a sources-only search for the country's name (its
// app reads ?q= and ?sources=1). Change this to its country page once that exists (README, "In the family").
const countriesHref = (name: string) => `${COUNTRIES_SITE.url}/?q=${encodeURIComponent(name)}&sources=1`;

export const CountryDossier: React.FC<Props> = ({ country: c, rankedCount, categories, indicators, macro, compareHref, onClose }) => {
  const [kind, setKind] = useState<number | 'all'>('all');
  const ranked = c.rank != null && c.compositeScore != null;
  const shown = indicators.filter(i => kind === 'all' || i.tier === kind);

  return (
    <Dialog labelledBy="dossier-title" onClose={onClose} variant="sheet" closeLabel="Close the dossier">
      <div className="flex-1 overflow-y-auto">
        {/* A div, not a header: inside the dialog a header would be read as a second banner landmark */}
        <div className="px-5 sm:px-7 pt-6 pb-4 border-b border-rule bg-sheet">
          <p className="caps text-gilt-text">Country dossier</p>
          <h2 id="dossier-title" tabIndex={-1} className="text-3xl mt-1 pr-12 outline-none">
            {c.name}
          </h2>
          <p className="text-sm text-muted mt-1">
            {c.region} · <abbr title="ISO 3166 country code" className="no-underline">{c.iso3}</abbr>
          </p>
          {ranked ? (
            <div className="mt-4 flex flex-wrap items-end gap-x-8 gap-y-2">
              <p>
                <span className="block text-sm text-muted">Overall score</span>
                <span className="num font-serif text-3xl font-semibold">{c.compositeScore!.toFixed(1)}</span>
                <span className="text-muted"> / 100</span>
              </p>
              <p>
                <span className="block text-sm text-muted">Rank</span>
                <span className="num font-serif text-3xl font-semibold">{c.rank}</span>
                <span className="text-muted"> of {rankedCount}</span>
              </p>
              <p className="text-sm text-muted basis-full">Under the weights you have set. Change them and these figures change.</p>
            </div>
          ) : (
            <p className="mt-4 font-serif">
              Not ranked. {c.rawFacts?.note ?? 'Too few of the indices cover it.'}
            </p>
          )}
          <div className="mt-4 flex flex-wrap gap-2 no-print">
            <Link href={compareHref} className="btn">
              Compare with another country
            </Link>
          </div>
        </div>

        <div className="px-5 sm:px-7 py-6 space-y-9">
          {ranked && (
            <section aria-labelledby="standouts-title">
              <h3 id="standouts-title" className="text-xl">
                Where it stands out
              </h3>
              <p className="text-sm text-muted mt-1">
                The indicators that lift its score most and hold it back most, given its world rank on each and how much
                each counts under your weights.
              </p>
              <div className="mt-3 grid sm:grid-cols-2 gap-x-6 gap-y-4">
                {[
                  { title: 'Lifts its score most', facts: c.activeStrengths },
                  { title: 'Holds it back most', facts: c.activeWeaknesses },
                ].map(group => (
                  <div key={group.title}>
                    <h4 className="caps text-gilt-text border-b border-rule pb-1">{group.title}</h4>
                    {group.facts.length === 0 ? (
                      <p className="text-sm text-muted mt-2">Nothing under these weights.</p>
                    ) : (
                      <ul className="mt-1">
                        {group.facts.map(f => (
                          <li key={f.indicatorId} className="py-2 border-b border-faint">
                            <p className="flex justify-between gap-3">
                              <span className="font-semibold">{f.indicatorName}</span>
                              <span className="num whitespace-nowrap">{f.badgeText}</span>
                            </p>
                            <p className="text-sm text-muted">{f.explanation}</p>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {c.hasData !== false && (
            <section aria-labelledby="dims-title">
              <h3 id="dims-title" className="text-xl">
                The eight dimensions
              </h3>
              <table className="mt-3 w-full text-sm border-collapse">
                <caption className="visually-hidden">Dimension scores, ranks and your weights for {c.name}</caption>
                <thead>
                  <tr className="border-b border-ink text-left">
                    <th scope="col" className="py-1.5 pr-2 font-semibold">Dimension</th>
                    <th scope="col" className="py-1.5 px-2 font-semibold w-[38%]"><span className="visually-hidden">Bar</span></th>
                    <th scope="col" className="py-1.5 px-2 font-semibold text-right">Score</th>
                    <th scope="col" className="py-1.5 px-2 font-semibold text-right">Rank</th>
                    <th scope="col" className="py-1.5 pl-2 font-semibold text-right">Weight</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map(cat => {
                    const v = c.dimensions[cat.id];
                    const r = c.dimensionRanks?.[cat.id];
                    return (
                      <tr key={cat.id} className="border-b border-faint">
                        <th scope="row" className="py-1.5 pr-2 text-left font-normal">{cat.name}</th>
                        <td className="py-1.5 px-2" aria-hidden="true">
                          <div className="keep-colours h-2 bg-faint">
                            <div className="h-full bg-heather" style={{ width: `${v ?? 0}%` }} />
                          </div>
                        </td>
                        <td className="py-1.5 px-2 text-right num font-semibold">{v != null ? v.toFixed(1) : <span className="text-muted font-normal">n/a</span>}</td>
                        <td className="py-1.5 px-2 text-right num whitespace-nowrap">{r ? `${r.rank} of ${r.total}` : ''}</td>
                        <td className="py-1.5 pl-2 text-right num text-muted">{macro[cat.id]}%</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {categories.some(cat => c.dimensions[cat.id] == null) && (
                <p className="text-sm text-muted mt-2">n/a: fewer than half of that dimension's indicators cover {c.name}, so it is left out of the overall score.</p>
              )}
            </section>
          )}

          <section aria-labelledby="inds-title">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <h3 id="inds-title" className="text-xl">
                All {indicators.length} indicators
              </h3>
              <div className="no-print">
                <label htmlFor="ind-kind" className="block text-sm font-semibold">
                  Show
                </label>
                <select id="ind-kind" value={kind} onChange={e => setKind(e.target.value === 'all' ? 'all' : Number(e.target.value))} className="field w-60">
                  <option value="all">Every kind ({indicators.length})</option>
                  {[1, 2, 3, 4].map(t => (
                    <option key={t} value={t}>
                      {KINDS[t]} ({indicators.filter(i => i.tier === t).length})
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <table className="mt-3 w-full text-sm border-collapse">
              <caption className="visually-hidden">Each indicator for {c.name}: its published value and year, its score out of 100, and its world rank</caption>
              <thead>
                <tr className="border-b border-ink text-left">
                  <th scope="col" className="py-1.5 pr-2 font-semibold">Indicator and publisher</th>
                  <th scope="col" className="py-1.5 px-2 font-semibold text-right">Value</th>
                  <th scope="col" className="py-1.5 px-2 font-semibold text-right">Score</th>
                  <th scope="col" className="py-1.5 pl-2 font-semibold text-right">Rank</th>
                </tr>
              </thead>
              {categories.map(cat => {
                const rows = shown.filter(i => i.category === cat.id);
                if (rows.length === 0) return null;
                return (
                  <tbody key={cat.id}>
                    <tr>
                      <th scope="rowgroup" colSpan={4} className="pt-4 pb-1 text-left caps text-gilt-text border-b border-rule">
                        {cat.name}
                      </th>
                    </tr>
                    {rows.map(ind => {
                      const v = c.indicators[ind.id];
                      return (
                        <tr key={ind.id} className="border-b border-faint align-top">
                          <th scope="row" className="py-2 pr-2 text-left font-normal">
                            <span className="font-semibold">{ind.name}</span>
                            <span className="block text-muted">
                              {ind.sourceUrl ? <a href={ind.sourceUrl}>{ind.source}</a> : ind.source}
                            </span>
                          </th>
                          <td className="py-2 px-2 text-right num">{v?.formatted ?? <span className="text-muted">No figure</span>}</td>
                          <td className="py-2 px-2 text-right num font-semibold">{v?.score != null ? Math.round(v.score) : ''}</td>
                          <td className="py-2 pl-2 text-right num whitespace-nowrap">{v?.rank != null ? `${v.rank} of ${v.total}` : ''}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                );
              })}
            </table>
            <p className="text-sm text-muted mt-2">
              Score: the published value rescaled from 0 (2.5th percentile of countries) to 100 (97.5th), flipped where
              lower is better. Ranks are among the countries each publisher covers. <Link href="/method">How it works</Link>
            </p>
          </section>

          {c.rawFacts?.keyFacts && c.rawFacts.keyFacts.length > 0 && (
            <section aria-labelledby="facts-title">
              <h3 id="facts-title" className="text-xl">
                Key facts
              </h3>
              <dl className="mt-3 grid grid-cols-2 gap-x-6 text-sm">
                {c.rawFacts.keyFacts.map(f => (
                  <div key={f.label} className="py-1.5 border-b border-faint">
                    <dt className="text-muted">{f.label}</dt>
                    <dd className="num font-semibold m-0">{f.value}</dd>
                  </div>
                ))}
              </dl>
              <p className="text-sm text-muted mt-2">
                Climate figures are 1970 to 2000 WorldClim normals for the country's cities, weighted by population.
                {c.coverage && <> {c.name} is covered by {c.coverage.replace('/', ' of ')} indicators.</>}
              </p>
            </section>
          )}

          <section aria-labelledby="more-title" className="border-t border-rule pt-5 no-print">
            <h3 id="more-title" className="text-lg">
              More on {c.name}
            </h3>
            <ul className="mt-2 space-y-2 text-sm">
              <li>
                <Link href="/behind-the-rankings">Behind the rankings</Link>: the limits of these indices, and results that
                look wrong but are not.
              </li>
              <li className="flex items-center gap-2">
                <Spine cloth={COUNTRIES_SITE.cloth} className="w-6 h-6" />
                <span>
                  <a href={countriesHref(c.name)}>Statements by {c.name} at the UN, on Where Countries Stand</a>, a
                  sister site. It has no page for each country yet, so this opens a search of its UN records for{' '}
                  {c.name}.
                </span>
              </li>
            </ul>
          </section>
        </div>
      </div>
    </Dialog>
  );
};
