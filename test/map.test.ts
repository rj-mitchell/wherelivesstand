// The map's geometry (docs/DECISIONS.md): on Mercator, Antarctica, Greenland and the
// far-northern Arctic islands would be enormous, so they are left out. This stops a refresh of the Natural Earth
// file from bringing them back unnoticed.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

interface Topology {
  transform: { scale: [number, number]; translate: [number, number] };
  arcs: [number, number][][];
  objects: { countries: { geometries: { id?: string; type: string; properties: { name: string }; arcs: unknown }[] } };
}

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
