// The legend under the map. Its bar is sampled from the same ramp the map uses, and the ticks sit where
// those scores fall, so legend and map cannot disagree.
import React from 'react';
import { legendGradient, type ColourScale } from '../lib/colour';

interface Props {
  scale: ColourScale;
  mode: 'light' | 'dark';
  regionName: string;
  hoverScore: number | null | undefined;
}

export const MapLegend: React.FC<Props> = ({ scale, mode, regionName, hoverScore }) => {
  const [lo, hi] = scale.domain;
  const ticks = scale.relative
    ? [lo, (lo + hi) / 2, hi].map(v => Math.round(v * 10) / 10)
    : [20, 30, 40, 50, 60, 70, 80, 90];
  const pct = (v: number) => `${(scale.position(v) * 100).toFixed(2)}%`;
  return (
    <div className="mt-3 flex flex-wrap items-end gap-x-8 gap-y-3 text-sm">
      <div className="flex-1 min-w-[min(16rem,100%)] max-w-xl">
        <p className="font-semibold mb-1">
          Overall score{scale.relative ? `, ${regionName}'s own range (${lo.toFixed(1)} to ${hi.toFixed(1)})` : ' under your weights, 0 to 100'}
        </p>
        {/* keep-colours: in forced colours the map keeps its shades, so the legend keeps them too */}
        <div className="keep-colours relative h-3 border border-rule" style={{ background: legendGradient(mode) }}>
          {hoverScore != null && (
            <span className="absolute -top-1 -bottom-1 w-[3px] -ml-[1.5px] bg-ink outline outline-2 outline-sheet" style={{ left: pct(hoverScore) }} aria-hidden="true" />
          )}
        </div>
        <div className="legend-ticks relative h-5 mt-0.5 num text-xs text-muted" aria-hidden="true">
          {ticks.map((t, i) => (
            // Where the bar is narrow (a phone, or beside the weights on a tablet), 30 and 80 would run into
            // "20 or less" and "90 or more", so they are left out (.legend-tick-minor in index.css)
            <span key={t} className={`absolute -translate-x-1/2 whitespace-nowrap ${!scale.relative && (t === 30 || t === 80) ? 'legend-tick-minor' : ''}`} style={{ left: pct(t), transform: i === 0 ? 'none' : i === ticks.length - 1 ? 'translateX(-100%)' : undefined }}>
              {scale.relative ? t.toFixed(1) : i === 0 ? '20 or less' : i === ticks.length - 1 ? '90 or more' : t}
            </span>
          ))}
        </div>
        <p className="visually-hidden">
          Pale is a lower score, dark a higher one{scale.relative ? `, from ${lo.toFixed(1)} to ${hi.toFixed(1)}` : ', from 20 or less to 90 or more'}.
        </p>
      </div>
      <div className="flex items-center gap-2">
        <svg width="28" height="14" aria-hidden="true">
          <rect width="28" height="14" fill="url(#nodata)" className="stroke-rule" strokeWidth="1" />
        </svg>
        <span>Not ranked</span>
      </div>
    </div>
  );
};
