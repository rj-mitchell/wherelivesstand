// Every ranked country in a sortable table: the text equivalent of the map, and the place to read
// across the dimensions. Follows the map's region.
import React, { useMemo, useState } from 'react';
import type { ComputedCountry, MacroCategory, MacroCategoryConfig } from '../types';
import { REGIONS, isCountryInRegion, type RegionId } from '../data/regions';
import { Link } from '../lib/nav';
import { Icon } from './Icon';

const SHORT: Record<MacroCategory, string> = {
  safety: 'Safety',
  governance: 'Governance',
  rights: 'Liberties',
  economy: 'Economy',
  health: 'Health',
  infrastructure: 'Infra­structure',
  climate: 'Weather',
  environment: 'Environ­ment',
};

type SortKey = 'rank' | 'name' | MacroCategory;

interface Props {
  list: ComputedCountry[];
  categories: MacroCategoryConfig[];
  region: RegionId;
  onRegion: (r: RegionId) => void;
  hrefFor: (iso3: string) => string;
  selectedIso: string | null;
}

const fold = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

export const RankingsTable: React.FC<Props> = ({ list, categories, region, onRegion, hrefFor, selectedIso }) => {
  const [sort, setSort] = useState<{ key: SortKey; desc: boolean }>({ key: 'rank', desc: false });
  const [filter, setFilter] = useState('');

  const inRegion = useMemo(() => list.filter(c => isCountryInRegion(c, region)), [list, region]);
  const ranked = inRegion.filter(c => c.rank != null);
  const unranked = inRegion.filter(c => c.rank == null);
  const regionRank = useMemo(() => new Map(ranked.map((c, i) => [c.iso3, i + 1])), [ranked]);

  const rows = useMemo(() => {
    const q = fold(filter.trim());
    const shown = q ? ranked.filter(c => fold(c.name).includes(q) || c.iso3.toLowerCase() === q) : ranked;
    const value = (c: ComputedCountry): number | string | null =>
      sort.key === 'rank' ? c.rank : sort.key === 'name' ? c.name : c.dimensions[sort.key];
    return [...shown].sort((a, b) => {
      const va = value(a);
      const vb = value(b);
      if (va == null && vb == null) return (a.rank ?? 0) - (b.rank ?? 0);
      if (va == null) return 1; // missing values always last
      if (vb == null) return -1;
      const cmp = typeof va === 'string' ? va.localeCompare(vb as string) : (va as number) - (vb as number);
      // Dimension scores read best first by default
      const natural = sort.key === 'rank' || sort.key === 'name' ? cmp : -cmp;
      return sort.desc ? -natural : natural;
    });
  }, [ranked, filter, sort]);

  const header = (key: SortKey, label: React.ReactNode, title?: string) => {
    const active = sort.key === key;
    const ariaSort = active ? ((key === 'rank' || key === 'name') !== sort.desc ? 'ascending' : 'descending') : 'none';
    return (
      <th
        scope="col"
        aria-sort={ariaSort}
        className={`px-1.5 py-2 align-bottom ${key === 'name' ? 'text-left' : 'text-right'} ${key === 'rank' ? 'table-pin table-pin-rank' : key === 'name' ? 'table-pin table-pin-name' : ''}`}
      >
        <button
          type="button"
          onClick={() => setSort(s => ({ key, desc: s.key === key ? !s.desc : false }))}
          title={title ? `Sort by ${title}` : undefined}
          className={`inline-flex items-center gap-0.5 min-h-6 font-semibold cursor-pointer hover:text-heather ${key === 'name' ? '' : 'flex-row-reverse text-right'} ${active ? 'text-ink' : 'text-muted'}`}
        >
          <span>{label}</span>
          <Icon name={active ? (sort.desc ? 'up' : 'down') : 'sort'} className={`w-3.5 h-3.5 ${active ? '' : 'opacity-50'}`} />
        </button>
      </th>
    );
  };

  const regionName = REGIONS.find(r => r.id === region)?.name ?? 'World';

  return (
    <section id="rankings" aria-labelledby="rankings-title" tabIndex={-1} className="scroll-mt-4 outline-none">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 id="rankings-title" className="text-2xl">
            The rankings{region !== 'global' ? `: ${regionName}` : ''}
          </h2>
          <p className="text-sm text-muted mt-1">
            {ranked.length} ranked {ranked.length === 1 ? 'country' : 'countries'}
            {region !== 'global' ? ` in ${regionName}` : ''}, under your weights. Dimension scores are out of 100. Sort by any column.
          </p>
        </div>
        <div className="flex flex-wrap gap-2 items-end no-print">
          <div>
            <label htmlFor="table-region" className="block text-sm font-semibold">
              Region
            </label>
            <select id="table-region" value={region} onChange={e => onRegion(e.target.value as RegionId)} className="field w-44">
              {REGIONS.map(r => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="table-filter" className="block text-sm font-semibold">
              Filter by name
            </label>
            <input id="table-filter" type="search" value={filter} onChange={e => setFilter(e.target.value)} className="field w-52" autoComplete="off" />
          </div>
        </div>
      </div>

      {/* On a phone the table scrolls sideways, fading at the end with more columns off screen; the rank and the
          country stay pinned at the start, with a rule at their edge once the rest has scrolled under them */}
      <div
        className="mt-4 overflow-x-auto scroll-fade-x table-pinned border-t-2 border-ink"
        onScroll={e => e.currentTarget.toggleAttribute('data-scrolled', Math.abs(e.currentTarget.scrollLeft) > 0)}
      >
        <table className="w-full text-sm border-collapse min-w-[44rem]">
          <caption className="visually-hidden">
            Overall and dimension scores for each ranked country{region !== 'global' ? ` in ${regionName}` : ''}, under the current weights
          </caption>
          <thead className="border-b border-ink">
            <tr className="bg-paper">
              {header('rank', region !== 'global' ? 'Rank' : 'Rank', 'rank')}
              {header('name', 'Country', 'name')}
              <th scope="col" className="px-1.5 py-2 text-right align-bottom font-semibold">
                Score
              </th>
              {categories.map(c => (
                <React.Fragment key={c.id}>{header(c.id, <abbr title={c.name} className="no-underline">{SHORT[c.id]}</abbr>, c.name)}</React.Fragment>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map(c => (
              <tr key={c.iso3} className={`border-b border-faint ${c.iso3 === selectedIso ? 'bg-heather-tint' : 'bg-paper hover:bg-sheet'}`}>
                <td className="table-pin table-pin-rank px-1.5 py-1.5 text-right num text-muted">
                  {region !== 'global' ? (
                    <>
                      {regionRank.get(c.iso3)}
                      <span className="visually-hidden"> in {regionName}; </span>
                      <span className="block text-xs">world {c.rank}</span>
                    </>
                  ) : (
                    c.rank
                  )}
                </td>
                <th scope="row" className="table-pin table-pin-name px-1.5 py-1.5 text-left font-normal">
                  <Link href={hrefFor(c.iso3)} className="text-ink">
                    {c.name}
                  </Link>
                </th>
                <td className="px-1.5 py-1.5 text-right num font-semibold">{c.compositeScore?.toFixed(1)}</td>
                {categories.map(cat => (
                  <td key={cat.id} className="px-1.5 py-1.5 text-right num">
                    {c.dimensions[cat.id] != null ? (c.dimensions[cat.id] as number).toFixed(1) : <span className="text-muted" title="Not enough data">n/a</span>}
                  </td>
                ))}
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={3 + categories.length} className="px-2 py-6 text-center text-muted">
                  No ranked country matches “{filter}”.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {unranked.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg">Not ranked{region !== 'global' ? ` in ${regionName}` : ''}</h3>
          <p className="text-sm text-muted mt-1">
            A country needs at least 20 of the indicators to be ranked. Territories of another country are not listed.
          </p>
          <ul className="mt-2 grid sm:grid-cols-2 gap-x-8 gap-y-1 text-sm">
            {unranked.map(c => (
              <li key={c.iso3}>
                <Link href={hrefFor(c.iso3)} className="text-ink">
                  {c.name}
                </Link>{' '}
                <span className="text-muted">{c.coverage ? `(${c.coverage.replace('/', ' of ')} indicators)` : ''}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
};
