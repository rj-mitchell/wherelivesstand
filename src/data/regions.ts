// The regions the map can zoom to, and which countries each takes in.

export type RegionId =
  | 'global'
  | 'europe'
  | 'middle-east'
  | 'north-america'
  | 'south-america'
  | 'asia'
  | 'africa'
  | 'oceania';

export interface RegionDefinition {
  id: RegionId;
  name: string;
  /** Map centre [longitude, latitude] and zoom, for the Mercator projection in WorldMap.tsx. */
  center: [number, number];
  zoom: number;
}

// Regional views on the Mercator projection, with Europe and North America eased out a little to fit the frame.
// The world view is centred on the land, which runs from about 56°S to 78°N.
export const REGIONS: RegionDefinition[] = [
  { id: 'global', name: 'World', center: [10.6, 28.5], zoom: 1 },
  { id: 'europe', name: 'Europe', center: [16, 54], zoom: 2.8 },
  { id: 'middle-east', name: 'Middle East', center: [44, 28], zoom: 3.6 },
  { id: 'north-america', name: 'North America', center: [-98, 46], zoom: 1.9 },
  { id: 'south-america', name: 'South America', center: [-60, -22], zoom: 2.1 },
  { id: 'asia', name: 'Asia', center: [95, 26], zoom: 2 },
  { id: 'africa', name: 'Africa', center: [20, 2], zoom: 2 },
  { id: 'oceania', name: 'Oceania', center: [142, -26], zoom: 2.5 },
];

export const regionById = (id: string): RegionDefinition | undefined => REGIONS.find(r => r.id === id);

export const MIDDLE_EAST_ISOS = new Set([
  'SAU', 'ARE', 'QAT', 'KWT', 'BHR', 'OMN', 'YEM',
  'ISR', 'PSE', 'JOR', 'LBN', 'SYR', 'IRQ', 'IRN',
  'TUR', 'CYP', 'CYN', 'EGY',
]);

export function isCountryInRegion(country: { iso3: string; region: string }, regionId: RegionId): boolean {
  const iso = country.iso3;
  switch (regionId) {
    case 'global':
      return true;
    case 'middle-east':
      return MIDDLE_EAST_ISOS.has(iso);
    case 'europe':
      return country.region === 'Europe' || iso === 'CYP' || iso === 'CYN' || iso === 'TUR';
    case 'north-america':
      return country.region === 'North America' || country.region === 'Americas';
    case 'south-america':
      return country.region === 'South America';
    case 'asia':
      return country.region === 'Asia' && !MIDDLE_EAST_ISOS.has(iso);
    case 'africa':
      return country.region === 'Africa';
    case 'oceania':
      return country.region === 'Oceania';
  }
}
