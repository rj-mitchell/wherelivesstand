// Builds the map's geometry, src/data/world-50m.json, from Natural Earth's 1:50m countries (version 4.1, as
// packaged by world-atlas 2.0.2). docs/DESIGN.md#the-map says what is left out, and decision 16 in
// docs/DECISIONS.md which boundaries differ from Natural Earth's de facto lines:
//
// - Antarctica, Greenland and the southern islands are left out, and so are the far-northern Arctic islands:
//   Svalbard, Jan Mayen, and every Russian island wholly north of 67°N and Canadian one wholly north of 60°N;
// - St Lawrence Island is moved 2.82° east, wholly clear of the map's edge at 169.4°W (the 10.6° rotation);
// - as in Natural Earth's UK point of view (10m, version 5.1.1): Crimea is part of Ukraine; Western Sahara is
//   one area, cut from Morocco along its northern boundary; the Golan Heights are cut from Israel along the line
//   that view draws, and are an area of their own.
//
//   node scripts/build_map.mjs
//
// Needs the npm registry, for world-atlas, mapshaper and topojson-server (all pinned below), and nothing else.
// Running it again gives the same file. Then run npm test: test/map.test.ts checks the result.
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, writeFileSync, rmSync, statSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const WORLD_ATLAS = '2.0.2';
const MAPSHAPER = 'mapshaper@0.7.101';
const TOPOJSON_SERVER = 'topojson-server@3.0.1';
const OUT = fileURLToPath(new URL('../src/data/world-50m.json', import.meta.url));

const tmp = mkdtempSync(join(tmpdir(), 'wls-map-'));
const run = (cmd, args) => execFileSync(cmd, args, { cwd: tmp, stdio: ['ignore', 'ignore', 'inherit'] });
const readJson = file => JSON.parse(readFileSync(join(tmp, file), 'utf8'));
const writeJson = (file, value) => writeFileSync(join(tmp, file), JSON.stringify(value));

try {
  run('npm', ['pack', `world-atlas@${WORLD_ATLAS}`, '--silent']);
  run('tar', ['-xzf', `world-atlas-${WORLD_ATLAS}.tgz`]);
  const atlas = readJson('package/countries-50m.json');

  // Everything is worked in world-atlas's own grid (whole units of 0.0036° by 0.0017°), so that every
  // boundary not cut below keeps exactly its points. Planar tools then see plain numbers, not longitudes, and
  // leave alone the rings that cross 180° (Russia's and Fiji's), which d3 draws correctly on the sphere.
  const [kx, ky] = atlas.transform.scale;
  const [tx, ty] = atlas.transform.translate;
  const grid = ([lon, lat]) => [(lon - tx) / kx, (lat - ty) / ky];
  const arcs = atlas.arcs.map(arc => {
    let x = 0;
    let y = 0;
    return arc.map(([dx, dy]) => [(x += dx), (y += dy)]);
  });
  const ring = indexes => {
    const points = [];
    for (const i of indexes) {
      const arc = i < 0 ? arcs[~i].slice().reverse() : arcs[i];
      points.push(...(points.length ? arc.slice(1) : arc));
    }
    return points;
  };
  const features = atlas.objects.countries.geometries.map(g => ({
    type: 'Feature',
    id: g.id,
    properties: { name: g.properties.name },
    polygons: (g.type === 'MultiPolygon' ? g.arcs : [g.arcs]).map(p => p.map(ring)),
  }));
  const byName = name => features.find(f => f.properties.name === name);
  // A polygon's bounds in degrees
  const bounds = polygon => {
    const xs = polygon[0].map(([x]) => x * kx + tx);
    const ys = polygon[0].map(([, y]) => y * ky + ty);
    return [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)];
  };
  const within = ([x0, y0, x1, y1], [bx0, by0, bx1, by1]) => x0 >= bx0 && y0 >= by0 && x1 <= bx1 && y1 <= by1;

  // Antarctica, Greenland, the French Southern and Antarctic Lands, South Georgia, and Heard and McDonald Islands
  const leftOut = ['010', '304', '260', '239', '334'];
  let shapes = features.filter(f => !leftOut.includes(f.id));

  // The far-northern Arctic islands
  const arctic = {
    Russia: ([, y0]) => y0 >= 67,
    Canada: ([, y0]) => y0 >= 60,
    Norway: ([, y0, x1]) => y0 >= 74 || x1 < 0, // Svalbard and Bear Island; Jan Mayen
  };
  for (const [name, north] of Object.entries(arctic)) {
    const f = byName(name);
    f.polygons = f.polygons.filter(p => !north(bounds(p)));
  }

  // St Lawrence Island
  for (const p of byName('United States of America').polygons) {
    if (within(bounds(p), [-172, 62.8, -168.5, 64])) p[0] = p[0].map(([x, y]) => [x + Math.round(2.8224 / kx), y]);
  }

  // Crimea, a polygon of Russia's of its own, bordering Ukraine on the isthmus
  const russia = byName('Russia');
  const isCrimea = p => within(bounds(p), [32, 44, 37, 46.5]);
  byName('Ukraine').polygons.push(...russia.polygons.filter(isCrimea));
  russia.polygons = russia.polygons.filter(p => !isCrimea(p));

  // Areas cut from one country and given to another. Western Sahara's northern boundary is the parallel along
  // which Natural Earth draws its northern edge (27°39′N). The Golan line is Israel's eastern boundary in Natural
  // Earth's UK point of view, simplified to 0.004°, between the points where it meets Israel's boundary at 1:50m
  // (by Lebanon and by the Yarmouk), then closed well to the east.
  const israel = byName('Israel').polygons[0][0];
  const snap = point => {
    const [x, y] = grid(point);
    return israel.reduce((a, b) => (Math.hypot(b[0] - x, b[1] - y) < Math.hypot(a[0] - x, a[1] - y) ? b : a));
  };
  const golanLine = [
    [35.6345, 33.2487], [35.6662, 33.2469], [35.6602, 33.236], [35.6613, 33.2129], [35.6722, 33.15],
    [35.6369, 33.0772], [35.6343, 33.052], [35.6213, 33.0503], [35.5877, 33.0179], [35.6198, 32.9839],
    [35.6148, 32.9212], [35.6023, 32.9086], [35.6382, 32.8747], [35.6414, 32.8648], [35.6354, 32.7937],
    [35.6414, 32.7721], [35.6354, 32.7694], [35.6344, 32.7522], [35.595, 32.7074],
  ];
  const [north, south] = [snap([35.6039, 33.2401]), snap([35.6118, 32.6819])];
  const east = [[35.62, 32.6], [36.5, 32.6], [36.5, 33.7]].map(grid);
  const golan = [north, ...golanLine.map(grid), south, ...east, [north[0], east[2][1]], north];
  const sahara = Math.max(...byName('W. Sahara').polygons[0][0].map(([, y]) => y));
  const [x0, y0] = grid([-20, 20]);
  const [x1] = grid([-8, 20]);
  const cuts = [
    { from: 'Morocco', to: 'W. Sahara', id: '732', ring: [[x0, y0], [x0, sahara], [x1, sahara], [x1, y0], [x0, y0]] },
    { from: 'Israel', to: 'Golan Heights', id: null, ring: golan },
  ];

  // The cuts, and the joining of Crimea to Ukraine, are made by mapshaper on just the countries concerned.
  // `area` is twice a ring's signed area, positive if it runs anticlockwise: d3, like world-atlas, wants the outer
  // ring of each polygon clockwise and its holes anticlockwise.
  const area = r => r.reduce((s, [x, y], i) => (i ? s + r[i - 1][0] * y - x * r[i - 1][1] : s), 0);
  const orient = (r, clockwise) => ((area(r) < 0) === clockwise ? r : r.slice().reverse());
  const geometry = polygons =>
    polygons.length === 1 ? { type: 'Polygon', coordinates: polygons[0] } : { type: 'MultiPolygon', coordinates: polygons };
  const collection = list => ({ type: 'FeatureCollection', features: list.map(({ polygons, ...f }) => ({ ...f, geometry: geometry(polygons) })) });
  const changed = ['Ukraine', 'W. Sahara', ...cuts.map(c => c.from)];
  writeJson('changed.json', collection(changed.map(byName)));
  for (const [i, c] of cuts.entries()) {
    writeJson(`cut${i}.json`, collection([{ type: 'Feature', properties: {}, polygons: [[orient(c.ring, true)]] }]));
  }
  const list = names => `[${names.map(n => JSON.stringify(n)).join(', ')}]`;
  const args = ['--yes', MAPSHAPER, '-i', 'changed.json', 'id-field=id', 'name=countries'];
  args.push('-filter', `!${list(cuts.map(c => c.from))}.includes(name)`, '+', 'name=rest', '-target', 'countries');
  for (const [i, c] of cuts.entries()) {
    args.push('-filter', `name == ${JSON.stringify(c.from)}`, '+', `name=in${i}`, '-clip', `cut${i}.json`);
    args.push('-each', `name = ${JSON.stringify(c.to)}; id = ${JSON.stringify(c.id)}`, '-target', 'countries');
    args.push('-filter', `name == ${JSON.stringify(c.from)}`, '+', `name=out${i}`, '-erase', `cut${i}.json`, '-target', 'countries');
  }
  const layers = ['rest', ...cuts.flatMap((_, i) => [`in${i}`, `out${i}`])];
  args.push('-merge-layers', `target=${layers.join(',')}`, 'force', 'name=changed');
  args.push('-dissolve', 'fields=name', 'copy-fields=id', 'no-repair');
  args.push('-o', 'format=geojson', 'id-field=id', 'precision=0.001', 'cut.json');
  run('npx', args);

  // Back on the grid, in place of the countries they came from; the Golan Heights follow Israel
  const round = r => r.map(([x, y]) => [Math.round(x), Math.round(y)]).filter((p, i, a) => !i || p[0] !== a[i - 1][0] || p[1] !== a[i - 1][1]);
  const cut = readJson('cut.json').features.map(f => ({
    type: 'Feature',
    ...(f.id == null ? {} : { id: f.id }),
    properties: { name: f.properties.name },
    polygons: (f.geometry.type === 'Polygon' ? [f.geometry.coordinates] : f.geometry.coordinates).map(p => p.map((r, i) => orient(round(r), i === 0))),
  }));
  shapes = shapes.flatMap(f => {
    const name = f.properties.name;
    if (!changed.includes(name)) return [f];
    const own = cut.find(c => c.properties.name === name);
    return name === 'Israel' ? [own, ...cut.filter(c => c.properties.name === 'Golan Heights')] : [own];
  });
  writeJson('countries.json', collection(shapes));

  // The topology, its arcs delta-encoded on world-atlas's grid
  run('npx', ['--yes', '-p', TOPOJSON_SERVER, 'geo2topo', 'countries=countries.json', '-o', 'topology.json']);
  const topology = readJson('topology.json');
  delete topology.bbox;
  topology.transform = atlas.transform;
  topology.arcs = topology.arcs.map(arc => arc.map(([x, y], i) => (i ? [x - arc[i - 1][0], y - arc[i - 1][1]] : [x, y])));
  writeFileSync(OUT, JSON.stringify(topology));
  console.log(`build_map: ${topology.objects.countries.geometries.length} shapes, ${statSync(OUT).size} bytes`);
} finally {
  rmSync(tmp, { recursive: true, force: true });
}
