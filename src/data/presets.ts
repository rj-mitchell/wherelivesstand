// Starting points for the dials. Each sets the eight dimension weights; nothing else.
import type { MacroCategory } from '../types/index.ts';

export type PresetId = 'balanced' | 'physical' | 'institutional' | 'remote-worker' | 'young-family' | 'rights';

export interface Preset {
  id: PresetId;
  label: string;
  /** One line on what it puts first, shown under the label. */
  summary: string;
  weights: Record<MacroCategory, number>;
}

export const PRESETS: Preset[] = [
  {
    id: 'balanced',
    label: 'Balanced',
    summary: 'Every dimension at 50%.',
    weights: { safety: 50, governance: 50, rights: 50, economy: 50, health: 50, infrastructure: 50, climate: 50, environment: 50 },
  },
  {
    id: 'physical',
    label: 'Physical',
    summary: 'Weather, clean air and water, health and safety first.',
    weights: { safety: 80, governance: 20, rights: 20, economy: 30, health: 85, infrastructure: 80, climate: 100, environment: 95 },
  },
  {
    id: 'institutional',
    label: 'Institutional',
    summary: 'Civil liberties, rule of law and the economy first.',
    weights: { safety: 50, governance: 95, rights: 100, economy: 85, health: 35, infrastructure: 35, climate: 10, environment: 25 },
  },
  {
    id: 'remote-worker',
    label: 'Remote worker',
    summary: 'Broadband, weather, living costs and safety first.',
    weights: { safety: 80, governance: 45, rights: 40, economy: 80, health: 50, infrastructure: 100, climate: 95, environment: 40 },
  },
  {
    id: 'young-family',
    label: 'Young family',
    summary: 'Safety, health and schooling, clean air and water first.',
    weights: { safety: 100, governance: 60, rights: 55, economy: 80, health: 100, infrastructure: 80, climate: 60, environment: 90 },
  },
  {
    id: 'rights',
    label: 'Rights and liberties',
    summary: 'Civil liberties, governance and the economy first.',
    weights: { safety: 60, governance: 95, rights: 100, economy: 90, health: 70, infrastructure: 30, climate: 30, environment: 75 },
  },
];

export const presetById = (id: string): Preset | undefined => PRESETS.find(p => p.id === id);

/** The preset whose weights these are exactly, if any. */
export function matchingPreset(macro: Record<MacroCategory, number>): Preset | undefined {
  return PRESETS.find(p => (Object.keys(p.weights) as MacroCategory[]).every(c => macro[c] === p.weights[c]));
}
