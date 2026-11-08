// The region tabs above the map. They stay on one row with the zoom buttons (docs/DECISIONS.md, decision 6),
// so on a phone they scroll sideways. A faded edge with an arrow shows when more tabs lie off either side, and
// tapping it scrolls them along; the chosen region's tab is always scrolled into view.
import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { REGIONS, type RegionId } from '../data/regions';
import { Icon } from './Icon';

// The width of the faded edge, in pixels (.region-more in index.css): a tab scrolled into view clears it
const FADE = 40;

export const RegionTabs: React.FC<{ region: RegionId; onRegion: (region: RegionId) => void }> = ({ region, onRegion }) => {
  const row = useRef<HTMLDivElement>(null);
  const [more, setMore] = useState({ left: false, right: false });

  const measure = useCallback(() => {
    const el = row.current;
    if (!el) return;
    const left = el.scrollLeft > 1;
    const right = el.scrollLeft + el.clientWidth < el.scrollWidth - 1;
    setMore(m => (m.left === left && m.right === right ? m : { left, right }));
  }, []);

  useEffect(() => {
    const el = row.current;
    if (!el) return;
    measure();
    if (typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [measure]);

  // Keep the chosen region's tab in view, for a region chosen elsewhere (the table, the address bar)
  useLayoutEffect(() => {
    const el = row.current;
    const tab = el?.querySelector<HTMLElement>('[aria-pressed="true"]');
    if (!el || !tab) return;
    if (tab.offsetLeft < el.scrollLeft + FADE) el.scrollLeft = Math.max(0, tab.offsetLeft - FADE);
    else if (tab.offsetLeft + tab.offsetWidth > el.scrollLeft + el.clientWidth - FADE)
      el.scrollLeft = tab.offsetLeft + tab.offsetWidth - el.clientWidth + FADE;
    measure();
  }, [region, measure]);

  const scrollBy = (direction: 1 | -1) => {
    const el = row.current;
    if (!el) return;
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    el.scrollBy({ left: direction * el.clientWidth * 0.75, behavior: reduce ? 'auto' : 'smooth' });
  };

  return (
    <div className="relative min-w-0">
      {/* Padded by the width of the focus ring, and pulled back by as much, so a focused tab's ring isn't cut off
          by the scrolling row (the faded edges sit out over the padding too, index.css) */}
      <div ref={row} onScroll={measure} role="group" aria-label="Show a region" className="relative flex gap-1 overflow-x-auto region-tabs p-1.5 -m-1.5">
        {REGIONS.map(r => (
          <button
            key={r.id}
            type="button"
            aria-pressed={region === r.id}
            onClick={() => onRegion(r.id)}
            className={`press shrink-0 whitespace-nowrap min-h-[36px] px-2.5 text-sm border cursor-pointer ${region === r.id ? 'bg-heather text-on-heather border-heather font-semibold' : 'bg-sheet border-rule hover:border-heather'}`}
          >
            {r.name}
          </button>
        ))}
      </div>
      {/* Pointer-only hints: a keyboard reaches every tab with Tab, and the row scrolls to the focused one */}
      {more.left && (
        <div aria-hidden="true" className="region-more region-more-left" onClick={() => scrollBy(-1)}>
          <Icon name="chevron" className="w-5 h-5 rotate-180" />
        </div>
      )}
      {more.right && (
        <div aria-hidden="true" className="region-more region-more-right" onClick={() => scrollBy(1)}>
          <Icon name="chevron" className="w-5 h-5" />
        </div>
      )}
    </div>
  );
};
