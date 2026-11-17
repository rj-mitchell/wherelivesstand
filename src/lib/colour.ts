// The map's colour scale: one hue (heather), light to dark, so that order reads from lightness alone
// and holds for every kind of colour vision. Low scores are pale and high scores dark on paper; in dark
// mode the anchor flips (low scores sink into the dark ground, high scores are bright). The legend is
// drawn by sampling these same functions, so it cannot drift from the map.

/** Scores at or below the floor take the palest step; at or above the ceiling, the darkest. */
export const SCALE_FLOOR = 20;
export const SCALE_CEILING = 90;

type Mode = 'light' | 'dark';

const HUE = 325; // heather (#5E3F63 is about oklch(0.40 0.06 325))

// OKLCH -> sRGB (Björn Ottosson's OKLab matrices)
function oklchToHex(L: number, C: number, h: number): string {
  const a = C * Math.cos((h * Math.PI) / 180);
  const b = C * Math.sin((h * Math.PI) / 180);
  const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = L - 0.0894841775 * a - 1.291485548 * b;
  const l = l_ ** 3;
  const m = m_ ** 3;
  const s = s_ ** 3;
  const lin = [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ];
  const toByte = (x: number) => {
    const c = Math.max(0, Math.min(1, x));
    const v = c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055;
    return Math.round(v * 255);
  };
  return '#' + lin.map(toByte).map(n => n.toString(16).padStart(2, '0')).join('');
}

/** The colour at position t (0 = lowest, 1 = highest) on the scale. */
export function rampColour(t: number, mode: Mode = 'light'): string {
  const x = Math.max(0, Math.min(1, t));
  // Chroma swells in the middle of the ramp, where the eye separates steps most easily
  const C = 0.03 + 0.075 * Math.sin(Math.PI * Math.min(1, x * 1.1));
  if (mode === 'dark') return oklchToHex(0.44 + 0.5 * x, C * 0.9, HUE);
  return oklchToHex(0.74 - 0.46 * x, C, HUE);
}

/** Where a score sits on the world scale, 0 to 1. */
export const worldPosition = (score: number) =>
  (Math.max(SCALE_FLOOR, Math.min(SCALE_CEILING, score)) - SCALE_FLOOR) / (SCALE_CEILING - SCALE_FLOOR);

export interface ColourScale {
  /** Scores covered: [low, high]. Scores outside take the end colours. */
  domain: [number, number];
  /** Whether this is a region's own scale rather than the world scale. */
  relative: boolean;
  position: (score: number) => number;
  colour: (score: number, mode?: Mode) => string;
}

export function worldScale(): ColourScale {
  return {
    domain: [SCALE_FLOOR, SCALE_CEILING],
    relative: false,
    position: worldPosition,
    colour: (s, mode) => rampColour(worldPosition(s), mode),
  };
}

/** A scale stretched over the scores of one region, so differences within it show. */
export function regionScale(scores: number[]): ColourScale {
  if (scores.length < 2) return worldScale();
  const lo = Math.min(...scores);
  const hi = Math.max(...scores);
  if (hi - lo < 2) return worldScale();
  const position = (s: number) => (Math.max(lo, Math.min(hi, s)) - lo) / (hi - lo);
  return { domain: [lo, hi], relative: true, position, colour: (s, mode) => rampColour(position(s), mode) };
}

/** A CSS gradient for the legend, sampled from the ramp itself. */
export function legendGradient(mode: Mode = 'light', steps = 24): string {
  const stops = Array.from({ length: steps + 1 }, (_, i) => `${rampColour(i / steps, mode)} ${((i / steps) * 100).toFixed(1)}%`);
  return `linear-gradient(to right, ${stops.join(', ')})`;
}
