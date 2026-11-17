// Draws the site's picture mark: a desk globe on its stand, in gilt, on a heather tile with a fine gilt edge
// (docs/DESIGN.md, "The mark"). The globe has a graticule (curved parallels, so it reads as round) and three of
// its cells are shaded in heather from pale to dark, as countries are on the map.
//
// Writes, from the same shapes:
// - public/mark.svg and public/mark-dark.svg: the mark (for 40 pixels and up), in light and in dark mode;
// - public/mark-small.svg and public/mark-small-dark.svg: a simpler drawing for 16 to 32 pixels (no gilt edge,
//   no shaded cells, fewer and heavier lines, set on a 4-unit grid so that it lands on whole pixels at 16);
// - with --png, public/mark-512.png, the mark at 512 pixels (needs Playwright's Chromium).
//
// src/components/Mark.tsx draws the same shapes in the page; test/mark.test.ts checks that they agree.
//
//   node scripts/mark.mjs [--png]
import { writeFileSync } from 'node:fs';

const f = n => +n.toFixed(2);

// The shapes on a 64-unit grid. cx, cy and r are the globe; R the gilt meridian ring around it.
function shapes({ cx, cy, r, sag, meridian, parallels, R, stem, footWidth: fw, footHeight: fh, knob, cells = [] }) {
  // A parallel at offset `off` from the equator, seen from a little above: the lower half of an ellipse
  const par = off => {
    const rx = Math.sqrt(r * r - off * off);
    return { yc: cy + off, rx, ry: sag * rx };
  };
  const parY = (off, x) => {
    const p = par(off);
    return p.yc + p.ry * Math.sqrt(Math.max(0, 1 - ((x - cx) / p.rx) ** 2));
  };
  // A meridian, `m` units from the centre at the equator (negative to the left; +-r is the globe's edge)
  const merX = (m, y) => cx + m * Math.sqrt(Math.max(0, 1 - ((y - cy) / r) ** 2));
  const cross = (m, off) => {
    let y = cy + off;
    for (let i = 0; i < 60; i++) y = parY(off, merX(m, y));
    return [merX(m, y), y];
  };
  // A cell between two meridians and two parallels, traced along its four sides
  const N = 8;
  const cell = (m1, m2, o1, o2) => {
    const [ax, ay] = cross(m1, o1), [bx, by] = cross(m2, o1), [qx, qy] = cross(m2, o2), [dx, dy] = cross(m1, o2);
    const pts = [];
    for (let i = 0; i <= N; i++) { const x = ax + ((bx - ax) * i) / N; pts.push([x, parY(o1, x)]); }
    for (let i = 1; i <= N; i++) { const y = by + ((qy - by) * i) / N; pts.push([merX(m2, y), y]); }
    for (let i = 1; i <= N; i++) { const x = qx + ((dx - qx) * i) / N; pts.push([x, parY(o2, x)]); }
    for (let i = 1; i < N; i++) { const y = dy + ((ay - dy) * i) / N; pts.push([merX(m1, y), y]); }
    return 'M' + pts.map(([x, y]) => `${f(x)} ${f(y)}`).join(' ') + 'z';
  };
  let grid = '';
  for (const off of parallels) {
    const p = par(off);
    grid += `M${f(cx - p.rx)} ${f(p.yc)}a${f(p.rx)} ${f(p.ry)} 0 0 0 ${f(2 * p.rx)} 0`;
  }
  grid += `M${cx} ${cy - r}v${2 * r}`;
  grid += `M${cx} ${cy - r}a${meridian} ${r} 0 0 0 0 ${2 * r}a${meridian} ${r} 0 0 0 0 ${-2 * r}`;
  const footY = cy + R + stem + fh;
  return {
    ring: `M${cx} ${cy - R}a${R} ${R} 0 0 1 0 ${2 * R}`,
    pins: `M${cx} ${cy - R}v${R - r}M${cx} ${cy + r}v${R - r + stem}`,
    foot: `M${cx - fw} ${footY}c0-${f(fh * 0.66)} ${f(fw * 0.45)}-${fh} ${fw}-${fh}s${fw} ${f(fh * 0.34)} ${fw} ${fh}z`,
    knob: { cx, cy: cy - R, r: knob },
    globe: { cx, cy, r },
    cells: cells.map(([m1, m2, o1, o2, tint]) => ({ d: cell(m1, m2, o1, o2), tint })),
    grid,
  };
}

// Heather (the site's cloth), lifted in dark mode as the family kit lifts it (--wts-cloth-lives); the kit's
// spine gilt; the ivory of Where MPs Stand's open book; and three heather tints for the shaded cells.
const LIGHT = { tile: '#5E3F63', gilt: '#D9BC72', ivory: '#F3EAD6', line: '#5E3F63', t1: '#DCCADD', t2: '#B99CBD', t3: '#8A6590' };
const DARK = { ...LIGHT, tile: '#7F5585' };

export const FULL = shapes({
  cx: 30, cy: 27.5, r: 15, sag: 0.2, meridian: 8, parallels: [-7.5, 0, 7.5],
  R: 18.5, stem: 3, footWidth: 9, footHeight: 4.5, knob: 1.8,
  cells: [[0, 8, -7.5, 0, 't3'], [8, 15, 0, 7.5, 't2'], [-8, 0, 0, 7.5, 't1']],
});
export const SMALL = shapes({
  cx: 30, cy: 28, r: 19, sag: 0.2, meridian: 10, parallels: [0],
  R: 24, stem: 0, footWidth: 12, footHeight: 4, knob: 3,
});

function svg(s, C, { small }) {
  const ringWidth = small ? 4 : 2.2, pinWidth = small ? 4 : 2, line = small ? 3.5 : 1.5;
  // The small drawing's lines are the tile's colour, so their ends never show against the tile
  const lineColour = small ? C.tile : C.line;
  const tile = small
    ? `<rect width="64" height="64" rx="8" fill="${C.tile}"/>`
    : `<rect width="64" height="64" rx="7" fill="${C.tile}"/><rect x="4.5" y="4.5" width="55" height="55" rx="4" fill="none" stroke="${C.gilt}" stroke-width="1.4"/>`;
  const g = s.globe;
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">${tile}` +
    `<path d="${s.ring}" fill="none" stroke="${C.gilt}" stroke-width="${ringWidth}"/>` +
    `<path d="${s.pins}" stroke="${C.gilt}" stroke-width="${pinWidth}"/>` +
    `<path d="${s.foot}" fill="${C.gilt}"/>` +
    `<circle cx="${s.knob.cx}" cy="${s.knob.cy}" r="${s.knob.r}" fill="${C.gilt}"/>` +
    `<circle cx="${g.cx}" cy="${g.cy}" r="${g.r}" fill="${C.ivory}"/>` +
    s.cells.map(c => `<path d="${c.d}" fill="${C[c.tint]}"/>`).join('') +
    `<path d="${s.grid}" fill="none" stroke="${lineColour}" stroke-width="${line}"/>` +
    (small ? '' : `<circle cx="${g.cx}" cy="${g.cy}" r="${g.r}" fill="none" stroke="${lineColour}" stroke-width="${line}"/>`) +
    `</svg>\n`
  );
}

// The files, by name under public/
export const files = () => ({
  'mark.svg': svg(FULL, LIGHT, { small: false }),
  'mark-dark.svg': svg(FULL, DARK, { small: false }),
  'mark-small.svg': svg(SMALL, LIGHT, { small: true }),
  'mark-small-dark.svg': svg(SMALL, DARK, { small: true }),
});

if (import.meta.url === `file://${process.argv[1]}`) {
  const pub = new URL('../public/', import.meta.url);
  const out = files();
  for (const [name, text] of Object.entries(out)) writeFileSync(new URL(name, pub), text);
  console.log(`mark: wrote ${Object.keys(out).map(n => `public/${n}`).join(', ')}`);
  if (process.argv.includes('--png')) {
    const { chromium } = await import('playwright');
    const browser = await chromium.launch(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {});
    const page = await browser.newPage({ viewport: { width: 512, height: 512 } });
    await page.setContent(`<style>html,body{margin:0;background:transparent}svg{display:block;width:512px;height:512px}</style>${out['mark.svg']}`);
    await page.screenshot({ path: new URL('mark-512.png', pub).pathname, omitBackground: true });
    await browser.close();
    console.log('mark: wrote public/mark-512.png');
  }
}
