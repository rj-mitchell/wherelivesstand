// The world map, coloured by overall score. Mercator, by the owner's choice (docs/DECISIONS.md, 5), so that small,
// densely populated countries such as Europe's are big enough to see and select; Antarctica, Greenland and the
// far-northern Arctic islands are left out of the geometry (src/data/world-50m.json) because Mercator makes them
// enormous. Every country in the data is a keyboard stop with a name; Enter opens its dossier.
import React, { useMemo, useState, useCallback, useLayoutEffect, useRef } from 'react';
import { ComposableMap, Geographies, Geography, ZoomableGroup, type Geo } from 'react-simple-maps';
import type { ComputedCountry } from '../types';
import { REGIONS, isCountryInRegion, type RegionId } from '../data/regions';
import type { ColourScale } from '../lib/colour';
import { useColourMode } from '../lib/useColourMode';
import { MapLegend } from './MapLegend';
import { HoverCard, type HoverInfo } from './HoverCard';
import { Icon } from './Icon';
import { RegionTabs } from './RegionTabs';
import geoUrl from '../data/world-50m.json?url';

interface Props {
  byIso: Record<string, ComputedCountry>;
  rankedCount: number;
  scale: ColourScale;
  region: RegionId;
  relative: boolean;
  regionRanks: Record<string, number>;
  selectedIso: string | null;
  onSelect: (iso3: string) => void;
  onRegion: (region: RegionId) => void;
  onRelative: (relative: boolean) => void;
}

// Natural Earth shapes with no numeric code of their own
const SPECIAL_GEOMETRIES: Record<string, string> = {
  'Siachen Glacier': 'IND',
  Somaliland: 'SOM',
  Kosovo: 'XKX',
  'N. Cyprus': 'CYN',
  'Indian Ocean Ter.': 'IOT',
};

// The geometry runs from about 56°S to 78°N. At this scale and size it fills the frame edge to edge.
const WIDTH = 960;
const HEIGHT = 520;

// A country drawn smaller than this, in pixels each way, at the current zoom and width (Vatican City on the
// whole world) is left out of the tab order: focus there would show nothing. It is still in the search and the
// table, and zooming in brings it back.
const MIN_FOCUS_PX = 2;

const ordinal = (n: number) => {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
};

export function describeCountry(c: ComputedCountry, rankedCount: number, parentName?: string): string {
  if (c.isDependency) return `${c.name}: a territory of ${parentName ?? c.parentName ?? c.parentIso}, not ranked separately`;
  if (c.compositeScore == null || c.rank == null) return `${c.name}: not ranked. ${c.rawFacts?.note ?? ''}`.trim();
  return `${c.name}: score ${c.compositeScore}, ${ordinal(c.rank)} of ${rankedCount}`;
}

export const WorldMap: React.FC<Props> = ({ byIso, rankedCount, scale, region, relative, regionRanks, selectedIso, onSelect, onRegion, onRelative }) => {
  const mode = useColourMode();
  const regionDef = REGIONS.find(r => r.id === region) ?? REGIONS[0];
  const [position, setPosition] = useState({ coordinates: regionDef.center, zoom: regionDef.zoom });
  const [hover, setHover] = useState<HoverInfo | null>(null);
  // The country under the pointer and the one with keyboard focus, whose outlines are drawn again on top
  const [hoverKey, setHoverKey] = useState<string | null>(null);
  const [focusKey, setFocusKey] = useState<string | null>(null);

  // Screen pixels per unit of the map's own 960 by 520, to tell which countries are too small to see
  const frameRef = useRef<HTMLDivElement>(null);
  const [unitPx, setUnitPx] = useState(1);
  useLayoutEffect(() => {
    const frame = frameRef.current;
    if (!frame) return;
    const measure = () => setUnitPx(frame.clientWidth / WIDTH || 1);
    measure();
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(measure) : null;
    ro?.observe(frame);
    return () => ro?.disconnect();
  }, []);
  // Each shape's larger side, in map units, worked out once
  const sizes = useRef(new WeakMap<Geo, number>());
  const sizeOf = (geo: Geo, bounds: (g: Geo) => [[number, number], [number, number]]) => {
    let size = sizes.current.get(geo);
    if (size === undefined) {
      const [[x0, y0], [x1, y1]] = bounds(geo);
      size = Number.isFinite(x0) ? Math.max(x1 - x0, y1 - y0) : 0;
      sizes.current.set(geo, size);
    }
    return size;
  };

  // Follow region changes made elsewhere (the table's filter, the address bar)
  const [shownRegion, setShownRegion] = useState(region);
  if (shownRegion !== region) {
    setShownRegion(region);
    setPosition({ coordinates: regionDef.center, zoom: regionDef.zoom });
  }

  const byNumeric = useMemo(() => {
    const map: Record<string, ComputedCountry> = {};
    for (const c of Object.values(byIso)) {
      if (c.numeric) map[String(parseInt(c.numeric, 10))] = c;
    }
    return map;
  }, [byIso]);

  const lookup = useCallback(
    (geo: { id?: string | number; properties?: { name?: string } }) => {
      const name = geo.properties?.name ?? '';
      if (geo.id != null && !Number.isNaN(parseInt(String(geo.id), 10))) {
        const c = byNumeric[String(parseInt(String(geo.id), 10))];
        if (c) return c;
      }
      return SPECIAL_GEOMETRIES[name] ? byIso[SPECIAL_GEOMETRIES[name]] : undefined;
    },
    [byIso, byNumeric],
  );

  const zoomBy = (f: number) => setPosition(p => ({ ...p, zoom: Math.max(1, Math.min(8, p.zoom * f)) }));

  return (
    // Positioned, so that the skip link below shows over the map when it is focused, not at the top of the page
    <figure className="relative m-0" aria-labelledby="map-caption">
      {/* One row: the region tabs scroll sideways on a phone, with a faded edge where more lie off the row; the
          zoom buttons stay at the end */}
      <div className="flex items-center justify-between gap-2 mb-2 no-print">
        <RegionTabs region={region} onRegion={onRegion} />
        <div role="group" aria-label="Zoom" className="flex gap-1 shrink-0">
          <button type="button" className="btn w-9 px-0 min-h-[36px]" onClick={() => zoomBy(1.5)} aria-label="Zoom in">
            <Icon name="plus" />
          </button>
          <button type="button" className="btn w-9 px-0 min-h-[36px]" onClick={() => zoomBy(1 / 1.5)} aria-label="Zoom out">
            <Icon name="minus" />
          </button>
          <button type="button" className="btn w-9 px-0 min-h-[36px]" onClick={() => setPosition({ coordinates: regionDef.center, zoom: regionDef.zoom })} aria-label={`Reset the view to ${regionDef.name}`}>
            <Icon name="reset" />
          </button>
        </div>
      </div>

      {region !== 'global' && (
        <div className="mb-2 text-sm flex flex-wrap items-center gap-x-4 gap-y-1 no-print" role="group" aria-label="Colour scale">
          <span className="text-muted">Colour countries</span>
          <label className="inline-flex items-center gap-1.5 cursor-pointer">
            <input type="radio" name="scale" checked={relative} onChange={() => onRelative(true)} className="accent-[rgb(var(--heather))]" />
            within {regionDef.name}
          </label>
          <label className="inline-flex items-center gap-1.5 cursor-pointer">
            <input type="radio" name="scale" checked={!relative} onChange={() => onRelative(false)} className="accent-[rgb(var(--heather))]" />
            on the world scale
          </label>
        </div>
      )}

      <a href="#rankings" className="skip-link">
        Skip the map: go to the table of rankings
      </a>
      {/* The weights come after the map and the table in the page (they sit beside the map at desktop widths) */}
      <a href="#weights" className="skip-link">
        Skip the map: go to your weights
      </a>
      <div id="map-frame" ref={frameRef} className="relative border border-rule bg-sheet" onMouseLeave={() => setHover(null)}>
        <ComposableMap
          projection="geoMercator"
          width={WIDTH}
          height={HEIGHT}
          projectionConfig={{ scale: 150, center: [-10.6, 22], rotate: [-10.6, 0, 0] }}
          className="map-svg"
          role="group"
          aria-label={`World map of overall scores${region !== 'global' ? `, showing ${regionDef.name}` : ''}. Each country is a button that opens its dossier; the table below lists the same figures.`}
        >
          <defs>
            <pattern id="nodata" patternUnits="userSpaceOnUse" width="5" height="5" patternTransform="rotate(45)">
              <rect width="5" height="5" className="map-nodata" />
              <line x1="0" y1="0" x2="0" y2="5" className="map-hatch" />
            </pattern>
          </defs>
          <ZoomableGroup
            center={position.coordinates}
            zoom={position.zoom}
            minZoom={1}
            maxZoom={8}
            onMoveEnd={p => setPosition(p)}
            // The wheel scrolls the page (pinch-zoom on a trackpad still zooms); one finger scrolls, two pan
            filterZoomEvent={(e: Event & { ctrlKey?: boolean; touches?: TouchList }) => {
              if (e.type === 'wheel') return Boolean(e.ctrlKey);
              if (e.type.startsWith('touch')) return (e.touches?.length ?? 0) > 1;
              return true;
            }}
          >
            <Geographies geography={geoUrl}>
              {({ geographies, path }) => {
                // In alphabetical order, so that Tab goes through the countries from A to Z (the file runs from Z)
                const sorted = geographies
                  .map(geo => ({ geo, c: lookup(geo) }))
                  .sort((x, y) => (x.c?.name ?? x.geo.properties?.name ?? '').localeCompare(y.c?.name ?? y.geo.properties?.name ?? ''));
                const outlines: { geo: Geo; kind: 'hover' | 'selected' | 'focus' }[] = [];
                const paths = sorted.map(({ geo, c }) => {
                  const parent = c?.isDependency && c.parentIso ? byIso[c.parentIso] : undefined;
                  const target = parent ?? c;
                  const inRegion = c ? isCountryInRegion(parent ?? c, region) : region === 'global';
                  let fill = 'url(#nodata)';
                  let cls = '';
                  if (c && !c.isDependency && c.compositeScore != null) {
                    fill = inRegion || region === 'global' ? scale.colour(c.compositeScore, mode) : '';
                    if (!fill) cls = 'map-outside';
                  } else if (!inRegion && region !== 'global') {
                    cls = 'map-outside';
                    fill = '';
                  }
                  const selected = target && target.iso3 === selectedIso;
                  if (target && geo.rsmKey === hoverKey) outlines.push({ geo, kind: 'hover' });
                  if (selected) outlines.push({ geo, kind: 'selected' });
                  if (geo.rsmKey === focusKey) outlines.push({ geo, kind: 'focus' });
                  const tiny = sizeOf(geo, path.bounds) * position.zoom * unitPx < MIN_FOCUS_PX;
                  const label = c ? describeCountry(c, rankedCount, parent?.name) : undefined;
                  const show = (e: React.MouseEvent | React.FocusEvent) => {
                    if (!c) return setHover({ name: geo.properties?.name ?? 'Unknown', note: 'Not covered by the sources separately; not ranked.', anchor: anchorFrom(e) });
                    setHover({
                      name: c.name,
                      country: c,
                      parentName: parent?.name,
                      regionRank: region !== 'global' && !c.isDependency ? regionRanks[c.iso3] : undefined,
                      regionName: regionDef.name,
                      rankedCount,
                      anchor: anchorFrom(e),
                    });
                  };
                  return (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      fill={fill || undefined}
                      className={`${cls} ${selected ? 'is-selected' : ''}`}
                      tabIndex={target && !tiny ? 0 : -1}
                      role={target ? 'button' : undefined}
                      aria-label={label}
                      aria-hidden={target ? undefined : true}
                      onMouseEnter={e => {
                        setHoverKey(geo.rsmKey);
                        show(e);
                      }}
                      onMouseMove={e => setHover(h => (h ? { ...h, anchor: { x: e.clientX, y: e.clientY } } : h))}
                      onMouseLeave={() => {
                        setHoverKey(null);
                        setHover(null);
                      }}
                      onFocus={e => {
                        setFocusKey((e.target as Element).matches(':focus-visible') ? geo.rsmKey : null);
                        show(e);
                      }}
                      onBlur={() => {
                        setFocusKey(null);
                        setHover(null);
                      }}
                      onClick={() => target && onSelect(target.iso3)}
                      onKeyDown={e => {
                        if (target && (e.key === 'Enter' || e.key === ' ')) {
                          e.preventDefault();
                          onSelect(target.iso3);
                        }
                      }}
                    />
                  );
                });
                const order = { hover: 0, selected: 1, focus: 2 };
                return (
                  <>
                    {paths}
                    {/* The hovered, selected and focused countries' outlines again, over every neighbour (the
                        countries are drawn A to Z, so a neighbour drawn later would cover half of the outline) */}
                    <g aria-hidden="true">
                      {outlines
                        .sort((x, y) => order[x.kind] - order[y.kind])
                        .map(({ geo, kind }) => (
                          <path key={`${kind}-${geo.rsmKey}`} d={geo.svgPath} className={`map-outline map-outline-${kind}`} />
                        ))}
                    </g>
                  </>
                );
              }}
            </Geographies>
          </ZoomableGroup>
        </ComposableMap>
      </div>
      {hover && <HoverCard info={hover} />}
      <MapLegend scale={scale} mode={mode} regionName={regionDef.name} hoverScore={hover?.country && !hover.country.isDependency ? hover.country.compositeScore : null} />
      <figcaption id="map-caption" className="mt-2 text-sm text-muted">
        Select a country, or tab to it and press Enter, for its full record. Hatched: territories, and places too few
        indices cover.
      </figcaption>
    </figure>
  );
};

function anchorFrom(e: React.MouseEvent | React.FocusEvent): { x: number; y: number } {
  if ('clientX' in e && e.type.startsWith('mouse')) return { x: e.clientX, y: e.clientY };
  const r = (e.target as Element).getBoundingClientRect();
  return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
}
