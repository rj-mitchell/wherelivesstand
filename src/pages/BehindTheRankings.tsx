// Behind the rankings: the traps in combining indices, results that look wrong and why, the strengths and
// blind spots of every index, and why the weights are left to the reader. The commentary is in
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

  return (
    <Page title="Behind the rankings" kicker="The limits of the indices">
      <p className="text-lg">
        No country is simply the best. Every ranking depends on what is counted and how much each thing is made to
        matter. This page explains the {critiques.length} indices behind the map: what each measures, where it falls
        short, and the traps in combining them.
      </p>
      <nav aria-label="On this page" className="my-6 border-y border-rule py-3 font-sans text-[0.9375rem]">
        <ul className="!my-0 !pl-0 !list-none flex flex-wrap gap-x-6 gap-y-1 [&_a]:inline-flex [&_a]:items-center [&_a]:min-h-6">
          <li><a href="#traps">{MACRO_THEMES.length} traps in country rankings</a></li>
          <li><a href="#odd-results">Results that look wrong</a></li>
          <li><a href="#every-index">Every index</a></li>
          <li><a href="#your-weights">The weights are yours</a></li>
        </ul>
      </nav>

      <section id="traps" aria-labelledby="traps-title" className="scroll-mt-4">
        <h2 id="traps-title">{MACRO_THEMES.length} traps in country rankings</h2>
        {MACRO_THEMES.map(t => (
          <article key={t.id} className="mt-6">
            <h3>{t.title}</h3>
            {t.points.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
            <p className="italic text-muted border-l-2 border-gilt pl-3">In short: {t.takeaway}</p>
          </article>
        ))}
      </section>

      <section id="odd-results" aria-labelledby="odd-title" className="scroll-mt-4">
        <h2 id="odd-title">Results that look wrong, and why they are not</h2>
        <p>All ranks are from the current data, with every dial at 50%.</p>
        {COUNTRY_ANOMALIES.map(a => (
          <article key={a.id} className="mt-8 border-t border-rule pt-4">
            <h3 className="!mt-0">
              <Link href={hrefFor(a.iso3)}>{a.countryName}</Link>: {a.headline}
            </h3>
            <p className="font-sans text-sm text-gilt-text num">{a.rankText}</p>
            <dl className="mt-3 space-y-3">
              <div>
                <dt className="font-semibold">Why it looks odd</dt>
                <dd className="m-0">{a.whyItLooksWrong}</dd>
              </div>
              <div>
                <dt className="font-semibold">What is going on</dt>
                <dd className="m-0">{a.theRealExplanation}</dd>
              </div>
              <div>
                <dt className="font-semibold">Overall</dt>
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
            <select id="bias-cat" value={cat} onChange={e => setCat(e.target.value)} className="field w-60">
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
            <details key={c.id} className="border-b border-rule group" open={q.trim().length > 0}>
              <summary className="py-3 cursor-pointer list-none flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                <span className="flex gap-2">
                  <Icon name="chevron" className="w-4 h-4 mt-1 shrink-0 motion-safe:transition-transform group-open:rotate-90 text-heather" />
                  <span>
                  <span className="font-semibold group-open:text-heather">{c.meta.name}</span>
                  <span className="block font-sans text-sm text-muted">
                    {categories.find(x => x.id === c.meta.category)?.name} · {c.meta.source}
                  </span>
                  </span>
                </span>
                <span className="font-sans text-sm whitespace-nowrap">Risk of bias: {c.biasRisk.toLowerCase()}</span>
              </summary>
              <div className="pb-4 font-sans text-[0.9375rem] space-y-2">
                <p className="!my-0">{c.whatItMeasures}</p>
                <p className="!my-0 text-muted text-sm">
                  Kind of data: {KIND[c.meta.tier] ?? c.meta.tierLabel}
                  {c.meta.coverage != null && <> · {c.meta.coverage} countries</>}
                  {c.meta.sourceUrl && (
                    <>
                      {' · '}
                      <a href={c.meta.sourceUrl}>The publisher's page</a>
                    </>
                  )}
                </p>
                <div className="grid md:grid-cols-3 gap-x-6 gap-y-2">
                  <div>
                    <h4 className="caps text-gilt-text !mt-2">Strengths</h4>
                    <ul className="!my-1">{c.pros.map((p, i) => <li key={i}>{p}</li>)}</ul>
                  </div>
                  <div>
                    <h4 className="caps text-gilt-text !mt-2">Weaknesses</h4>
                    <ul className="!my-1">{c.cons.map((p, i) => <li key={i}>{p}</li>)}</ul>
                  </div>
                  <div>
                    <h4 className="caps text-gilt-text !mt-2">Blind spot</h4>
                    <p className="!my-1">{c.blindSpot}</p>
                  </div>
                </div>
              </div>
            </details>
          ))}
          {shown.length === 0 && <p className="py-4 text-muted">No index matches. Clear the search or choose another dimension.</p>}
        </div>
      </section>

      <section id="your-weights" aria-labelledby="yours-title" className="scroll-mt-4">
        <h2 id="yours-title">The weights are yours</h2>
        <p>
          Published league tables fix the weights for you. This site does not: you decide how much each dimension
          counts. Priorities differ: a remote worker, a young family and a retired couple want different things from a
          country. Trade-offs are real: sunshine or safety, low taxes or public services, and there is no single right
          answer.
        </p>
        <p>
          Start from a preset such as Young family or Remote worker, or set the weight of each of the {critiques.length}{' '}
          indices yourself. <Link href={mapHref}>Go to the map and rankings</Link>.
        </p>
        <p>
          Disagree with an index we chose, or with how we scored it? <Link href="/corrections">Tell us</Link>.
        </p>
      </section>
    </Page>
  );
};
