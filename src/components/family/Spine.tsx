// A sister project's spine in its cloth, with two gilt bands, standing on a shelf (brand/README.md), drawn
// beside links to that site. The shelf takes the text colour so it shows in dark mode.
import React from 'react';

export const Spine: React.FC<{ cloth: string; className?: string; title?: string }> = ({ cloth, className = 'w-9 h-9', title }) => (
  <svg viewBox="0 0 64 64" className={className} role={title ? 'img' : undefined} aria-hidden={title ? undefined : true} aria-label={title} focusable="false">
    <rect x="22" y="10" width="20" height="44" fill={cloth} />
    <path d="M22 18h20M22 22h20" stroke="#B08D3C" strokeWidth="1.6" />
    <path d="M10 56h44" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
  </svg>
);
