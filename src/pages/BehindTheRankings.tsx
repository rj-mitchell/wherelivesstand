// Behind the rankings: the traps in combining indices, results that look wrong and the reasons, the strengths
// and blind spots of every index, and the case for leaving the weights to the reader. The commentary is in
// src/data/indexBiases.ts; its quoted figures are checked by test/critique.test.ts.
import React, { useMemo, useState } from 'react';
import type { IndicatorMeta, MacroCategoryConfig } from '../types';
import { MACRO_THEMES, INDICATOR_CRITIQUES, COUNTRY_ANOMALIES } from '../data/indexBiases';
import { Link } from '../lib/nav';
import { Page } from './Page';
import { Icon } from '../components/Icon';

interface Props {
  categories: MacroCategoryConfig[];
  indicators: IndicatorMeta[];
  hrefFor: (iso3: string) => string;
  mapHref: string;
}

const KIND: Record<number, string> = {
  1: 'Measured counts and rates',
  2: 'Composite index',
  3: 'Expert assessment',
  4: 'Derived from measurements',
};

export const BehindTheRankings: React.FC<Props> = ({ categories, indicators, hrefFor, mapHref }) => {
  const [cat, setCat] = useState('all');
  const [risk, setRisk] = useState('all');
  const [q, setQ] = useState('');
  const meta = useMemo(() => new Map(indicators.map(i => [i.id, i])), [indicators]);
  const critiques = INDICATOR_CRITIQUES.flatMap(c => (meta.get(c.id) ? [{ ...c, meta: meta.get(c.id)! }] : []));
  const shown = critiques.filter(c => {
    if (cat !== 'all' && c.meta.category !== cat) return false;
    if (risk !== 'all' && c.biasRisk !== risk) return false;
    const needle = q.trim().toLowerCase();
    return !needle || [c.meta.name, c.meta.source, c.whatItMeasures, c.blindSpot].some(t => t.toLowerCase().includes(needle));
  });

  const query = q.trim();
  const twoCol = 'lg:grid lg:grid-cols-3 lg:gap-x-10';

  return (
    <Page title="Behind the rankings">
      <div className={`${twoCol} items-start`}>
        <p className="text-lg lg:col-span-2 !mt-0">
          No country is simply the best. Every ranking depends on what is counted and how much each thing is made to
          matter, and each of the {critiques.length} indices behind the map has its own strengths and blind spots.
        </p>
        <nav aria-label="On this page" className="bg-panel px-5 py-4 mt-4 lg:mt-0 font-sans text-[0.9375rem]">
          <p className="!my-0 font-semibold">On this page</p>
          <ul className="!my-1 !pl-0 !list-none [&_a]:inline-flex [&_a]:items-center [&_a]:min-h-6">
            <li className="!my-0"><a href="#traps">Traps in country rankings</a></li>
            <li className="!my-0"><a href="#odd-results">Results that look wrong</a></li>
            <li className="!my-0"><a href="#every-index">Every index</a></li>
            <li className="!my-0"><a href="#your-weights">The weights are yours</a></li>
          </ul>
        </nav>
      </div>

      <section id="traps" aria-labelledby="traps-title" className="scroll-mt-4">
        <h2 id="traps-title">Traps in country rankings</h2>
        {MACRO_THEMES.map(t => (
          <article key={t.id} className={`${twoCol} border-t border-rule pt-4 mt-4`}>
            <h3 className="!mt-0 !text-lg">{t.title}</h3>
            <div className="lg:col-span-2 [&>p:first-child]:mt-2 lg:[&>p:first-child]:mt-0">
              {t.points.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
          </article>
        ))}
      </section>

      <section id="odd-results" aria-labelledby="odd-title" className="scroll-mt-4">
        <h2 id="odd-title">Results that look wrong</h2>
        <p>All ranks are from the current data, with every dial at 50%.</p>
        {COUNTRY_ANOMALIES.map(a => (
          <article key={a.id} className={`${twoCol} border-t border-rule pt-4 mt-6`}>
            <div>
              <h3 className="!mt-0 !text-lg">
                <Link href={hrefFor(a.iso3)}>{a.countryName}</Link>: {a.headline}
              </h3>
              <p className="!mt-1 font-sans text-sm text-muted num">{a.rankText}</p>
            </div>
            <dl className="lg:col-span-2 mt-3 lg:mt-0 space-y-3">
              <div>
                <dt className="font-semibold">The puzzle</dt>
                <dd className="m-0">{a.whyItLooksWrong}</dd>
              </div>
              <div>
                <dt className="font-semibold">The explanation</dt>
                <dd className="m-0">{a.theRealExplanation}</dd>
              </div>
              <div>
                <dt className="font-semibold">The overall rank</dt>
                <dd className="m-0">{a.whereItBalancesOut}</dd>
              </div>
            </dl>
          </article>
        ))}
      </section>

      <section id="every-index" aria-labelledby="every-title" className="scroll-mt-4">
        <h2 id="every-title">Every index</h2>
        <p>Each index's strengths, weaknesses and blind spot, with a judgement of how much its design could tilt the results.</p>
        <div className="mt-4 flex flex-wrap gap-3 font-sans text-sm items-end">
          <div>
            <label htmlFor="bias-cat" className="block font-semibold">Dimension</label>
            <select id="bias-cat" value={cat} onChange={e => setCat(e.target.value)} className="field w-72">
              <option value="all">All dimensions</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="bias-risk" className="block font-semibold">Risk of bias</label>
            <select id="bias-risk" value={risk} onChange={e => setRisk(e.target.value)} className="field w-36">
              <option value="all">Any</option>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
          </div>
          <div>
            <label htmlFor="bias-q" className="block font-semibold">Search</label>
            <input id="bias-q" type="search" value={q} onChange={e => setQ(e.target.value)} className="field w-56" />
          </div>
          <p className="text-muted !my-0" aria-live="polite">
            {shown.length} of {critiques.length} shown
          </p>
        </div>
        <div className="mt-4 border-t border-ink">
          {shown.map(c => (
            <details key={c.id} className="border-b border-rule group" open={query.length > 0}>
              <summary className="py-3 cursor-pointer list-none flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                <span className="flex gap-2">
                  <Icon name="chevron" className="w-4 h-4 mt-1 shrink-0 motion-safe:transition-transform group-open:rotate-90 text-heather" />
                  <span>
                    <span className="font-semibold group-open:text-heather">{c.meta.name}</span>
                    <span className="block font-sans text-sm text-muted">
                      {categories.find(x => x.id === c.meta.category)?.name}, from {c.meta.source}
                    </span>
                  </span>
                </span>
                <span className="font-sans text-sm whitespace-nowrap">Risk of bias: {c.biasRisk.toLowerCase()}</span>
              </summary>
              <div className="pb-4 font-sans text-[0.9375rem] space-y-2">
                <p className="!my-0">{c.whatItMeasures}</p>
                <p className="!my-0 text-muted text-sm">
                  Kind of data: {(KIND[c.meta.tier] ?? c.meta.tierLabel).toLowerCase()}.
                  {c.meta.coverage != null && <> Covers {c.meta.coverage} countries.</>}
                  {c.meta.sourceUrl && (
                    <>
                      {' '}
                      <a href={c.meta.sourceUrl}>The publisher's page</a>
                    </>
                  )}
                </p>
                <div className="grid md:grid-cols-3 gap-x-6 gap-y-2">
                  <div>
                    <h4 className="font-sans text-base !mt-2">Strengths</h4>
                    {c.pros.map((p, i) => <p key={i} className="!my-1">{p}</p>)}
                  </div>
                  <div>
                    <h4 className="font-sans text-base !mt-2">Weaknesses</h4>
                    {c.cons.map((p, i) => <p key={i} className="!my-1">{p}</p>)}
                  </div>
                  <div>
                    <h4 className="font-sans text-base !mt-2">Blind spot</h4>
                    <p className="!my-1">{c.blindSpot}</p>
                  </div>
                </div>
              </div>
            </details>
          ))}
          {shown.length === 0 && (
            <p className="py-4 text-muted">
              No index matches {query ? <>“{query}” </> : ''}with these choices. Clear the search, or choose another
              dimension or risk of bias.
            </p>
          )}
        </div>
      </section>

      <section id="your-weights" aria-labelledby="yours-title" className="scroll-mt-4">
        <h2 id="yours-title">The weights are yours</h2>
        <p>
          Published league tables fix the weights for you. Here you decide how much each dimension counts. Priorities
          differ: a remote worker, a young family and a retired couple want different things from a country. Trade-offs
          are real: sunshine or safety, low taxes or public services, and there is no single right answer.
        </p>
        <p>
          Start from a preset such as Young family or Remote worker, or set the weight of each of the {critiques.length}{' '}
          indices yourself. <Link href={mapHref}>Go to the map and rankings</Link>.
        </p>
        <p>
          If you think an index is the wrong choice, or that we scored it wrongly, <Link href="/corrections">tell us</Link>.
        </p>
      </section>
    </Page>
  );
};
