// The map's geometry, built by scripts/build_map.mjs (docs/DECISIONS.md, decisions 5 and 16): on Mercator,
// Antarctica, Greenland and the far-northern Arctic islands would be enormous, so they are left out; and Crimea,
// Western Sahara and the Golan Heights are drawn as in Natural Earth's UK point of view, not its de facto lines.
// This stops a rebuild of the file from undoing either unnoticed.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { geoContains } from 'd3-geo';

interface Topology {
  transform: { scale: [number, number]; translate: [number, number] };
  arcs: [number, number][][];
  objects: { countries: { geometries: { id?: string; type: string; properties: { name: string }; arcs: unknown }[] } };
}
type Position = [number, number];

const topo = JSON.parse(readFileSync(new URL('../src/data/world-50m.json', import.meta.url), 'utf8')) as Topology;
const geometries = topo.objects.countries.geometries;

test('Antarctica, Greenland and the southern islands are not on the map', () => {
  const left = ['010', '304', '260', '239', '334'];
  for (const g of geometries) assert.ok(!left.includes(String(g.id)), `${g.properties.name} (${g.id}) is on the map`);
  for (const name of ['Antarctica', 'Greenland']) assert.ok(!geometries.some(g => g.properties.name === name), `${name} is on the map`);
});

test('nothing used by a country reaches further north than about 78°N', () => {
  // Decode the arcs the countries use (quantised and delta-encoded) and find the northernmost point
  const used = new Set<number>();
  const walk = (a: unknown): void => {
    if (typeof a === 'number') used.add(a < 0 ? ~a : a);
    else if (Array.isArray(a)) a.forEach(walk);
  };
  geometries.forEach(g => walk(g.arcs));
  const [, ky] = topo.transform.scale;
  const [, ty] = topo.transform.translate;
  let north = -90;
  for (const i of used) {
    let y = 0;
    for (const [, dy] of topo.arcs[i]) {
      y += dy;
      north = Math.max(north, y * ky + ty);
    }
  }
  assert.ok(north < 78, `the map reaches ${north.toFixed(1)}°N`);
});

// Each shape as GeoJSON, in degrees, for d3's own test of which shape a point is in
function shapes() {
  const [kx, ky] = topo.transform.scale;
  const [tx, ty] = topo.transform.translate;
  const arcs = topo.arcs.map(arc => {
    let x = 0;
    let y = 0;
    return arc.map(([dx, dy]): Position => [(x += dx) * kx + tx, (y += dy) * ky + ty]);
  });
  const ring = (indexes: number[]) =>
    indexes.flatMap((i, n) => {
      const arc = i < 0 ? arcs[~i].slice().reverse() : arcs[i];
      return n ? arc.slice(1) : arc;
    });
  return geometries.map(g => {
    const polygons = (g.type === 'MultiPolygon' ? g.arcs : [g.arcs]) as number[][][];
    const coordinates = polygons.map(p => p.map(ring));
    return { name: g.properties.name, id: g.id, feature: { type: 'Feature' as const, properties: {}, geometry: { type: 'MultiPolygon' as const, coordinates } } };
  });
}

test('disputed places are drawn in the country decision 16 gives them', () => {
  const all = shapes();
  const at = (lon: number, lat: number) => all.filter(s => geoContains(s.feature, [lon, lat])).map(s => s.name);
  const places: [string, Position, string][] = [
    ['Simferopol', [34.1, 44.95], 'Ukraine'],
    ['Sevastopol', [33.52, 44.62], 'Ukraine'],
    ['Kerch', [36.47, 45.36], 'Ukraine'],
    ['Kyiv', [30.52, 50.45], 'Ukraine'],
    ['Moscow', [37.62, 55.76], 'Russia'],
    ['Taman', [36.72, 45.21], 'Russia'],
    ['Smara', [-11.66, 26.74], 'W. Sahara'],
    ['Laayoune', [-13.2, 27.15], 'W. Sahara'],
    ['Aousserd', [-14.33, 22.55], 'W. Sahara'],
    ['Rabat', [-6.84, 34.02], 'Morocco'],
    ['Tan-Tan', [-11.1, 28.44], 'Morocco'],
    ['Katzrin', [35.69, 32.99], 'Golan Heights'],
    ['Tiberias', [35.53, 32.79], 'Israel'],
    ['Damascus', [36.29, 33.51], 'Syria'],
  ];
  for (const [place, [lon, lat], country] of places) assert.deepEqual(at(lon, lat), [country], `${place} is in ${at(lon, lat).join(' and ') || 'no shape'}`);
});

test('every shape is drawn once, and Western Sahara keeps its numeric code', () => {
  const names = geometries.map(g => g.properties.name);
  assert.equal(new Set(names).size, names.length, 'a shape is in the file twice');
  assert.equal(geometries.find(g => g.properties.name === 'W. Sahara')?.id, '732');
  assert.equal(geometries.find(g => g.properties.name === 'Golan Heights')?.id, undefined);
});
