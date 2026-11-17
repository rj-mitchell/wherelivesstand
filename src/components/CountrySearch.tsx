// "Find a country": a combobox that lists matching countries as you type. Arrow keys move through the
// list, Enter opens the highlighted (or first) country's dossier, Escape clears.
import React, { useId, useMemo, useState } from 'react';
import type { ComputedCountry } from '../types';
import { Icon } from './Icon';
import { ordinal } from '../lib/scoring';

interface Props {
  countries: ComputedCountry[];
  onSelect: (iso3: string) => void;
  className?: string;
}

const fold = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

export const CountrySearch: React.FC<Props> = ({ countries, onSelect, className = '' }) => {
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const id = useId();
  const listId = `${id}-list`;

  const results = useMemo(() => {
    const q = fold(query.trim());
    if (!q) return [];
    const starts = countries.filter(c => fold(c.name).startsWith(q) || c.iso3.toLowerCase() === q);
    const contains = countries.filter(c => !starts.includes(c) && fold(c.name).includes(q));
    return [...starts, ...contains].slice(0, 8);
  }, [countries, query]);

  const choose = (c: ComputedCountry | undefined) => {
    if (!c) return;
    onSelect(c.iso3);
    setQuery('');
    setActive(0);
  };

  const open = results.length > 0;

  return (
    <div className={`relative ${className}`}>
      <label htmlFor={id} className="visually-hidden">
        Find a country
      </label>
      <span className="absolute inset-y-0 left-2.5 flex items-center text-muted pointer-events-none">
        <Icon name="search" />
      </span>
      <input
        id={id}
        type="search"
        role="combobox"
        aria-expanded={open}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={open ? `${listId}-${active}` : undefined}
        autoComplete="off"
        spellCheck={false}
        placeholder="Find a country"
        value={query}
        onChange={e => {
          setQuery(e.target.value);
          setActive(0);
        }}
        onKeyDown={e => {
          if (e.key === 'ArrowDown' && open) {
            e.preventDefault();
            setActive(a => (a + 1) % results.length);
          } else if (e.key === 'ArrowUp' && open) {
            e.preventDefault();
            setActive(a => (a - 1 + results.length) % results.length);
          } else if (e.key === 'Enter') {
            e.preventDefault();
            choose(results[active]);
          } else if (e.key === 'Escape') {
            setQuery('');
          }
        }}
        className="field pl-9"
      />
      <ul
        id={listId}
        role="listbox"
        aria-label="Matching countries"
        hidden={!open}
        className="absolute z-40 left-0 right-0 mt-1 bg-panel border border-rule max-h-80 overflow-y-auto"
      >
        {results.map((c, i) => (
          <li
            key={c.iso3}
            id={`${listId}-${i}`}
            role="option"
            aria-selected={i === active}
            onMouseDown={e => e.preventDefault()}
            onClick={() => choose(c)}
            onMouseEnter={() => setActive(i)}
            className={`flex items-baseline justify-between gap-3 px-3 py-2 cursor-pointer text-sm ${i === active ? 'bg-heather-tint' : ''}`}
          >
            <span>{c.name}</span>
            <span className="num text-muted text-xs whitespace-nowrap">
              {c.rank != null ? `${ordinal(c.rank)}, score ${c.compositeScore}` : 'Not ranked'}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};
