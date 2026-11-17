// A few line icons, drawn here rather than taken from an icon set. Each is decorative: the control it
// sits in carries the text or the accessible name.
import React from 'react';

const PATHS = {
  close: 'M6 6l12 12M18 6L6 18',
  search: 'M10.5 17a6.5 6.5 0 1 0 0-13 6.5 6.5 0 0 0 0 13zM15.5 15.5L20 20',
  plus: 'M12 5v14M5 12h14',
  minus: 'M5 12h14',
  reset: 'M4 12a8 8 0 1 0 2.6-5.9M4 4v4.5h4.5',
  swap: 'M7 7h12l-3-3M17 17H5l3 3',
  chevron: 'M9 6l6 6-6 6',
  external: 'M14 5h5v5M19 5l-8 8M17 14v5H5V7h5',
  sort: 'M8 9l4-4 4 4M8 15l4 4 4-4',
  up: 'M8 14l4-4 4 4',
  down: 'M8 10l4 4 4-4',
} as const;

export type IconName = keyof typeof PATHS;

export const Icon: React.FC<{ name: IconName; className?: string }> = ({ name, className = 'w-4 h-4' }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
    <path d={PATHS[name]} />
  </svg>
);
