// "Your weights": the presets, the eight dimension dials and, when switched on, a dial for each indicator.
import React, { useState } from 'react';
import type { IndicatorMeta, MacroCategory, MacroCategoryConfig } from '../types';
import { PRESETS, matchingPreset } from '../data/presets';
import { Icon } from './Icon';

interface Props {
  categories: MacroCategoryConfig[];
  indicators: IndicatorMeta[];
  macro: Record<MacroCategory, number>;
  sub: Record<string, number>;
  fine: boolean;
  onMacro: (cat: MacroCategory, value: number) => void;
  onPreset: (weights: Record<MacroCategory, number>) => void;
  onSub: (id: string, value: number) => void;
  onFine: (on: boolean) => void;
  onReset: () => void;
}

const Dial: React.FC<{
  id: string;
  label: React.ReactNode;
  value: number;
  onChange: (v: number) => void;
  small?: boolean;
  /** Put before the label: the dimension's button for showing its indicators. */
  before?: React.ReactNode;
}> = ({ id, label, value, onChange, small, before }) => (
  <div className={small ? 'py-0.5' : undefined}>
    <div className="flex items-center justify-between gap-2 min-h-6">
      <span className="flex items-center gap-0.5 min-w-0">
        {before}
        <label htmlFor={id} className={small ? 'text-sm' : 'text-sm font-semibold truncate'}>
          {label}
        </label>
      </span>
      <output htmlFor={id} className="num text-sm text-muted min-w-[3ch] text-right">
        {value}%
      </output>
    </div>
    <input
      id={id}
      type="range"
      min={0}
      max={100}
      step={5}
      value={value}
      aria-valuetext={`${value} per cent`}
      onChange={e => onChange(Number(e.target.value))}
      style={{ ['--fill' as string]: `${value}%` }}
    />
  </div>
);

// Compact, so that at a laptop's height the whole panel sits beside the map without scrolling while no
// dimension is open (docs/DECISIONS.md, 6): no introduction, the presets in a tight grid, and each
// dimension's indicators behind a small button beside its name.
export const WeightsPanel: React.FC<Props> = ({ categories, indicators, macro, sub, fine, onMacro, onPreset, onSub, onFine, onReset }) => {
  const [open, setOpen] = useState<MacroCategory | null>(null);
  const preset = matchingPreset(macro);

  return (
    <section aria-labelledby="weights-title" className="font-sans">
      <div className="flex items-baseline justify-between gap-3">
        <h2 id="weights-title" className="text-lg">
          Your weights
        </h2>
        <button type="button" onClick={onReset} className="inline-flex items-center gap-1 text-sm text-heather hover:text-ink cursor-pointer min-h-[24px]">
          <Icon name="reset" className="w-3.5 h-3.5" />
          Reset
        </button>
      </div>

      <fieldset className="mt-1.5">
        <legend className="visually-hidden">Start from a preset</legend>
        <div className="flex flex-wrap gap-1">
          {PRESETS.map(p => {
            const on = preset?.id === p.id;
            return (
              <button
                key={p.id}
                type="button"
                aria-pressed={on}
                title={p.summary}
                onClick={() => onPreset({ ...p.weights })}
                className={`grow min-h-[26px] px-1.5 py-0.5 text-[0.8125rem] leading-tight whitespace-nowrap border cursor-pointer ${on ? 'bg-heather text-on-heather border-heather font-semibold' : 'bg-sheet border-rule hover:border-heather'}`}
              >
                {p.label}
              </button>
            );
          })}
        </div>
        <p className="visually-hidden" aria-live="polite">
          {preset ? `${preset.label}. ${preset.summary}` : 'Your own weights. No preset matches the dials.'}
        </p>
      </fieldset>

      <div className="mt-2 border-t border-rule">
        {categories.map(cat => {
          const inCat = indicators.filter(i => i.category === cat.id);
          const expanded = open === cat.id;
          const toggle = (
            <button
              type="button"
              aria-expanded={expanded}
              aria-controls={`w-${cat.id}-more`}
              aria-label={`${expanded ? 'Hide' : 'Show'} the ${inCat.length} ${inCat.length === 1 ? 'indicator' : 'indicators'} in ${cat.name}`}
              title={`${expanded ? 'Hide' : 'Show'} its ${inCat.length} ${inCat.length === 1 ? 'indicator' : 'indicators'}`}
              onClick={() => setOpen(expanded ? null : cat.id)}
              className="shrink-0 inline-flex items-center justify-center w-6 h-6 -ml-1 text-heather hover:text-ink cursor-pointer"
            >
              <Icon name="chevron" className={`w-3.5 h-3.5 transition-transform ${expanded ? 'rotate-90' : ''}`} />
            </button>
          );
          return (
            <div key={cat.id} className="border-b border-faint">
              <Dial id={`w-${cat.id}`} label={cat.name} value={macro[cat.id]} onChange={v => onMacro(cat.id, v)} before={toggle} />
              <div id={`w-${cat.id}-more`} hidden={!expanded} className="pb-2">
                <p className="text-sm text-muted">{cat.description}</p>
                <ul className="mt-1.5 space-y-0.5">
                  {inCat.map(ind =>
                    fine ? (
                      <li key={ind.id} className="pl-3 border-l-2 border-faint">
                        <Dial id={`s-${ind.id}`} small label={ind.name} value={sub[ind.id] ?? 50} onChange={v => onSub(ind.id, v)} />
                      </li>
                    ) : (
                      <li key={ind.id} className="text-sm pl-3 border-l-2 border-faint">
                        {ind.name} <span className="text-muted">({ind.source})</span>
                      </li>
                    ),
                  )}
                </ul>
              </div>
            </div>
          );
        })}
      </div>

      <label className="mt-2 flex items-center gap-2 text-sm cursor-pointer">
        <input type="checkbox" checked={fine} onChange={e => onFine(e.target.checked)} className="w-4 h-4 accent-[rgb(var(--heather))]" />
        <span>Weight each indicator separately</span>
      </label>
    </section>
  );
};
