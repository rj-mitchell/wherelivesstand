// Two countries side by side: overall, by dimension and by indicator. A bar runs from the centre towards
// whichever country leads, as far as its lead; the leader is also named in text. Its title is the page's h1: it
// is open only on /compare.
import React from 'react';
import type { ComputedCountry, IndicatorMeta, MacroCategoryConfig } from '../types';
import { Dialog } from './Dialog';
import { Icon } from './Icon';

interface Props {
  a: ComputedCountry;
  b: ComputedCountry;
  choices: ComputedCountry[];
  categories: MacroCategoryConfig[];
  indicators: IndicatorMeta[];
  /** The weights are the balanced ones, every dimension at 50%. */
  balanced: boolean;
  closeHref: string;
  still?: boolean;
  onChange: (a: string, b: string) => void;
  onClose: () => void;
}

const fmt = (v: number | null | undefined) => (v == null ? 'n/a' : v.toFixed(1));

const Lead: React.FC<{ a: number | null | undefined; b: number | null | undefined; nameA: string; nameB: string }> = ({ a, b, nameA, nameB }) => {
  if (a == null || b == null) {
    return <span className="text-sm text-muted">{a == null && b == null ? 'Neither has a figure' : `Only ${a == null ? nameB : nameA} has a figure`}</span>;
  }
  const d = Math.round((a - b) * 10) / 10;
  const width = Math.min(50, (Math.abs(d) / 50) * 50);
  return (
    <div>
      {/* Drawn in SVG rather than sized with a style, which the static HTML could not carry (prerender.tsx) */}
      <svg className="keep-colours block w-full h-2.5 overflow-visible" aria-hidden="true" focusable="false">
        <rect width="100%" height="100%" className="fill-faint" />
        {d !== 0 && (
          <rect x={d > 0 ? `${50 - Math.max(width, 0.8)}%` : '50%'} width={`${Math.max(width, 0.8)}%`} height="100%" className={d > 0 ? 'fill-compare-a' : 'fill-compare-b'} />
        )}
        <rect x="50%" y="-3" width="1" height="16" className="fill-ink" />
      </svg>
      <p className={`text-xs mt-0.5 num ${d > 0 ? 'text-left' : d < 0 ? 'text-right' : 'text-center'}`}>
        {d === 0 ? 'Level' : `${d > 0 ? nameA : nameB} +${Math.abs(d).toFixed(1)}`}
      </p>
    </div>
  );
};

export const CompareDialog: React.FC<Props> = ({ a, b, choices, categories, indicators, balanced, closeHref, still, onChange, onClose }) => {
  const weights = balanced ? 'the balanced weights' : 'your weights';
  const both = a.compositeScore != null && b.compositeScore != null;
  const diff = both ? Math.round((a.compositeScore! - b.compositeScore!) * 10) / 10 : 0;
  let aheadA = 0;
  let aheadB = 0;
  let level = 0;
  for (const ind of indicators) {
    const sa = a.indicators[ind.id]?.score;
    const sb = b.indicators[ind.id]?.score;
    if (sa == null || sb == null) continue;
    if (sa > sb) aheadA++;
    else if (sb > sa) aheadB++;
    else level++;
  }
  const sorted = [...choices].sort((x, y) => x.name.localeCompare(y.name));

  const picker = (which: 'a' | 'b', value: string) => (
    <div className="flex-1 min-w-[12rem]">
      <label htmlFor={`cmp-${which}`} className="flex items-center gap-2 text-sm font-semibold">
        <span className={`keep-colours inline-block w-3 h-3 ${which === 'a' ? 'bg-compare-a' : 'bg-compare-b'}`} aria-hidden="true" />
        {which === 'a' ? 'First country' : 'Second country'}
      </label>
      <select
        id={`cmp-${which}`}
        value={value}
        onChange={e => (which === 'a' ? onChange(e.target.value, b.iso3 === e.target.value ? a.iso3 : b.iso3) : onChange(a.iso3 === e.target.value ? b.iso3 : a.iso3, e.target.value))}
        className="field mt-1"
      >
        {sorted.map(c => (
          <option key={c.iso3} value={c.iso3}>
            {c.name}
            {c.rank != null ? ` (${c.rank})` : ' (not ranked)'}
          </option>
        ))}
      </select>
    </div>
  );

  // The same column widths in both tables, so that the bars line up from one to the next; on a phone each row is a
  // grid, with the same columns in both
  const head = (
    <tr className="border-b border-ink text-left max-sm:hidden">
      <th scope="col" className="py-1.5 pr-2 font-semibold w-[30%]"><span className="visually-hidden">Measure</span></th>
      <th scope="col" className="py-1.5 px-2 font-semibold text-right w-[20%]">{a.name}</th>
      <th scope="col" className="py-1.5 px-2 font-semibold text-center w-[30%]">Who leads, and by how much</th>
      <th scope="col" className="py-1.5 pl-2 font-semibold w-[20%]">{b.name}</th>
    </tr>
  );

  return (
    <Dialog labelledBy="compare-title" onClose={onClose} closeHref={closeHref} variant="centre" closeLabel="Close the comparison" still={still}>
      {/* data-scroll: the static HTML's scroll position is carried over when the app takes over (main.tsx) */}
      <div className="flex-1 overflow-y-auto" data-scroll="compare">
        {/* A div: inside the dialog a header element would be read as a second banner landmark */}
        <div className="px-5 sm:px-7 pt-6 pb-5 bg-panel">
          <h1 id="compare-title" tabIndex={-1} className="text-2xl sm:text-3xl pr-12 outline-hidden">
            {a.name} and {b.name} compared
          </h1>
          <div className="mt-4 flex flex-wrap items-end gap-3 no-print">
            {picker('a', a.iso3)}
            <button type="button" className="btn" onClick={() => onChange(b.iso3, a.iso3)} aria-label="Swap the two countries">
              <Icon name="swap" />
              Swap
            </button>
            {picker('b', b.iso3)}
          </div>
          <p className="mt-4 text-lg">
            {both
              ? diff === 0
                ? `${a.name} and ${b.name} have the same overall score under ${weights}.`
                : `${diff > 0 ? a.name : b.name} leads by ${Math.abs(diff).toFixed(1)} points overall under ${weights} (${fmt(a.compositeScore)} to ${fmt(b.compositeScore)}).`
              : `${a.compositeScore == null ? a.name : b.name} is not ranked, so there is no overall comparison.`}
          </p>
          <p className="text-sm text-muted mt-1">
            Of the indicators both have, {a.name} scores higher on {aheadA}, {b.name} on {aheadB}
            {level ? `, and they are level on ${level}` : ''}.
          </p>
        </div>

        <div className="px-5 sm:px-7 py-6 space-y-8">
          <section aria-labelledby="cmp-dims">
            <h2 id="cmp-dims" className="text-xl">
              By dimension
            </h2>
            <div className="overflow-x-auto">
              <p className="sm:hidden mt-3 flex justify-between text-sm font-semibold border-b border-ink pb-1" aria-hidden="true">
                <span className="flex items-center gap-1.5"><span className="keep-colours inline-block w-2.5 h-2.5 bg-compare-a" />{a.name}</span>
                <span className="flex items-center gap-1.5">{b.name}<span className="keep-colours inline-block w-2.5 h-2.5 bg-compare-b" /></span>
              </p>
              <table className="mt-3 w-full text-sm border-collapse sm:min-w-[33rem] sm:table-fixed">
                <thead>{head}</thead>
                <tbody>
                  {categories.map(cat => (
                    <tr key={cat.id} className="border-b border-faint max-sm:grid max-sm:grid-cols-[5.5rem_1fr_5.5rem] max-sm:items-start">
                      <th scope="row" className="py-2 pr-2 text-left font-normal max-sm:col-span-3 max-sm:pb-0">{cat.name}</th>
                      <td className="py-2 px-2 text-right num font-semibold max-sm:text-left max-sm:px-0">{fmt(a.dimensions[cat.id])}</td>
                      <td className="py-2 px-2">
                        <Lead a={a.dimensions[cat.id]} b={b.dimensions[cat.id]} nameA={a.name} nameB={b.name} />
                      </td>
                      <td className="py-2 pl-2 num font-semibold max-sm:text-right">{fmt(b.dimensions[cat.id])}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section aria-labelledby="cmp-inds">
            <h2 id="cmp-inds" className="text-xl">
              By indicator
            </h2>
            <p className="text-sm text-muted mt-1">Scores out of 100, with each publisher's own figure beneath.</p>
            <div className="overflow-x-auto">
              <p className="sm:hidden mt-3 flex justify-between text-sm font-semibold border-b border-ink pb-1" aria-hidden="true">
                <span className="flex items-center gap-1.5"><span className="keep-colours inline-block w-2.5 h-2.5 bg-compare-a" />{a.name}</span>
                <span className="flex items-center gap-1.5">{b.name}<span className="keep-colours inline-block w-2.5 h-2.5 bg-compare-b" /></span>
              </p>
              <table className="mt-3 w-full text-sm border-collapse sm:min-w-[33rem] sm:table-fixed">
                <thead>{head}</thead>
                {categories.map(cat => (
                  <tbody key={cat.id}>
                    <tr>
                      <th scope="rowgroup" colSpan={4} className="pt-4 pb-1 text-left font-semibold border-b border-rule max-sm:block">
                        {cat.name}
                      </th>
                    </tr>
                    {indicators
                      .filter(i => i.category === cat.id)
                      .map(ind => {
                        const va = a.indicators[ind.id];
                        const vb = b.indicators[ind.id];
                        return (
                          <tr key={ind.id} className="border-b border-faint align-top max-sm:grid max-sm:grid-cols-[5.5rem_1fr_5.5rem]">
                            <th scope="row" className="py-2 pr-2 text-left font-normal max-sm:col-span-3 max-sm:pb-0">
                              {ind.name}
                              <span className="block text-muted">{ind.source}</span>
                            </th>
                            <td className="py-2 px-2 text-right num max-sm:text-left max-sm:px-0">
                              <span className="font-semibold">{va?.score != null ? Math.round(va.score) : 'n/a'}</span>
                              {va?.formatted && <span className="block text-muted">{va.formatted}</span>}
                            </td>
                            <td className="py-2 px-2">
                              <Lead a={va?.score} b={vb?.score} nameA={a.name} nameB={b.name} />
                            </td>
                            <td className="py-2 pl-2 num max-sm:text-right">
                              <span className="font-semibold">{vb?.score != null ? Math.round(vb.score) : 'n/a'}</span>
                              {vb?.formatted && <span className="block text-muted">{vb.formatted}</span>}
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                ))}
              </table>
            </div>
          </section>
        </div>
      </div>
    </Dialog>
  );
};
