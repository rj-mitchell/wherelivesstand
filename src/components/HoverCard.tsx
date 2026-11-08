// The small card that follows the pointer (or sits by the focused country) on the map. It is as wide as its
// longest line, so no line wraps (owner, 8 November 2026); on a screen too narrow for that, a line is cut short.
import React, { useLayoutEffect, useRef, useState } from 'react';
import type { ComputedCountry } from '../types';

export interface HoverInfo {
  name: string;
  country?: ComputedCountry;
  parentName?: string;
  regionRank?: number;
  regionName?: string;
  rankedCount?: number;
  note?: string;
  anchor: { x: number; y: number };
}

export const HoverCard: React.FC<{ info: HoverInfo }> = ({ info }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 280, h: 120 });
  useLayoutEffect(() => {
    const r = ref.current?.getBoundingClientRect();
    if (r && (Math.abs(r.width - size.w) > 1 || Math.abs(r.height - size.h) > 1)) setSize({ w: r.width, h: r.height });
  });
  const pad = 12;
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  let left = info.anchor.x + 16;
  if (left + size.w + pad > vw) left = info.anchor.x - size.w - 16;
  left = Math.max(pad, Math.min(vw - size.w - pad, left));
  let top = info.anchor.y + 16;
  if (top + size.h + pad > vh) top = info.anchor.y - size.h - 16;
  top = Math.max(pad, Math.min(vh - size.h - pad, top));

  const c = info.country;
  const ranked = c && !c.isDependency && c.rank != null;
  return (
    <div ref={ref} aria-hidden="true" className="fixed z-30 pointer-events-none w-max max-w-[calc(100vw-24px)] whitespace-nowrap bg-sheet border border-ink/70 p-3 text-sm [&_p]:truncate" style={{ left, top }}>
      <div className="flex items-baseline justify-between gap-6 border-b border-rule pb-1.5 mb-1.5">
        <span className="font-serif font-semibold text-base">{info.name}</span>
        {ranked && <span className="num font-semibold text-lg">{c.compositeScore}</span>}
      </div>
      {ranked ? (
        <>
          <p className="num">
            Ranked {c.rank} of {info.rankedCount}
            {info.regionRank ? `; ${info.regionRank} in ${info.regionName}` : ''}
          </p>
          {c.activeStrengths[0] && (
            <p className="mt-1">
              <span className="text-muted">Strongest:</span> {c.activeStrengths[0].indicatorName} ({c.activeStrengths[0].badgeText})
            </p>
          )}
          {c.activeWeaknesses[0] && (
            <p>
              <span className="text-muted">Weakest:</span> {c.activeWeaknesses[0].indicatorName} ({c.activeWeaknesses[0].badgeText})
            </p>
          )}
        </>
      ) : c?.isDependency ? (
        <p>A territory of {info.parentName ?? c.parentName}; not ranked separately. Opens {info.parentName ?? c.parentName}.</p>
      ) : (
        <p>{c?.rawFacts?.note ?? info.note ?? 'Not ranked.'}</p>
      )}
    </div>
  );
};
