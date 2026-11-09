// The phase banner, the masthead (the site's picture mark, its name and the family endorsement), the main navigation and the
// search, closed by a double rule. Compact, so that the map comes first (docs/DECISIONS.md, 6).
import React, { useLayoutEffect, useRef } from 'react';
import type { ComputedCountry } from '../types';
import type { View } from '../lib/url';
import { Link } from '../lib/nav';
import { endorsement } from 'virtual:family';
import { CountrySearch } from './CountrySearch';
import { Mark } from './Mark';

interface Props {
  view: View;
  compareOpen: boolean;
  mapHref: string;
  compareHref: string;
  countries: ComputedCountry[];
  onSelectCountry: (iso3: string) => void;
}

export const Masthead: React.FC<Props> = ({ view, compareOpen, mapHref, compareHref, countries, onSelectCountry }) => {
  const items: { href: string; label: string; current: boolean }[] = [
    { href: mapHref, label: 'Map and rankings', current: view === 'map' && !compareOpen },
    { href: compareHref, label: 'Compare', current: view === 'map' && compareOpen },
    { href: '/behind-the-rankings', label: 'Behind the rankings', current: view === 'behind-the-rankings' },
    { href: '/method', label: 'How it works', current: view === 'method' },
    { href: '/about', label: 'About', current: view === 'about' },
  ];

  // On a phone the navigation scrolls sideways: keep the current page's link in view, clear of the faded edge
  const nav = useRef<HTMLElement>(null);
  const currentLabel = items.find(i => i.current)?.label;
  useLayoutEffect(() => {
    const row = nav.current;
    const link = row?.querySelector<HTMLElement>('[aria-current="page"]');
    if (!row || !link || row.scrollWidth <= row.clientWidth) return;
    const r = row.getBoundingClientRect();
    const l = link.getBoundingClientRect();
    const fade = 32;
    if (l.right > r.right - fade) row.scrollLeft += l.right - r.right + fade;
    else if (l.left < r.left + fade) row.scrollLeft -= r.left + fade - l.left;
  }, [currentLabel]);

  return (
    <header className="no-print">
      {/* The phase banner, kept to one line so the map comes first */}
      <div className="border-b border-rule bg-sheet">
        <p className="max-w-page mx-auto px-4 md:px-8 py-1 text-[0.8125rem] flex items-baseline gap-x-2 whitespace-nowrap overflow-hidden">
          <strong className="caps text-paper bg-ink px-1.5 py-px font-sans tracking-wider">Beta</strong>
          <span className="truncate">
            <span className="sm:hidden">Still being tested.</span>
            <span className="hidden sm:inline">Still being tested: figures and methods may change.</span>
          </span>
          <Link href="/corrections">Report a problem</Link>
        </p>
      </div>
      {/* One row on a wide screen: the name and endorsement, the navigation, the search. Below 1280 pixels, where
          the three no longer fit on one row without hiding some of the navigation, the search moves beside or
          under the name and the navigation has a row of its own, which scrolls sideways on a phone. */}
      <div className="max-w-page mx-auto px-4 md:px-8 pt-3 md:pt-4">
        <div className="flex flex-wrap items-end gap-x-6 xl:gap-x-8 gap-y-2 double-rule">
          <div className="flex items-start gap-3 pb-2 mr-auto xl:mr-0">
            {/* The picture mark, as tall as the name and the endorsement together, so the masthead keeps its
                height. It links home like the name, but only the name is announced and takes focus. */}
            <Link href={mapHref} tabIndex={-1} aria-hidden="true" className="mt-1 no-underline">
              <Mark className="w-[52px] h-[52px] md:w-14 md:h-14" />
            </Link>
            <div className="flex flex-col gap-1.5">
              <Link href={mapHref} className="font-serif font-semibold text-[1.625rem] md:text-[1.875rem] text-ink no-underline leading-none tracking-tight hover:text-heather sm:whitespace-nowrap">
                Where Lives Stand
              </Link>
              {/* The family kit's endorsement (public/family/endorsement.html): the spine and "A Where They Stand project" */}
              <div className="wts-slot-endorsement" dangerouslySetInnerHTML={{ __html: endorsement }} />
            </div>
          </div>
          <CountrySearch countries={countries} onSelect={onSelectCountry} className="w-full sm:w-64 xl:w-60 mb-2 xl:order-last" />
          {/* Padded by the width of the focus ring, and pulled back by as much, so that a focused link's ring isn't
              cut off by the scrolling row; the bottom margin keeps the current link's rule on the double rule */}
          <nav ref={nav} aria-label="Main" className="w-full xl:w-auto xl:flex-1 min-w-0 overflow-x-auto scroll-fade-x p-1.5 -mx-1.5 -mt-1.5 -mb-[calc(0.375rem_+_1px)]">
            <ul className="flex gap-x-5 md:gap-x-6 whitespace-nowrap text-[0.9375rem] font-sans">
              {items.map(item => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    aria-current={item.current ? 'page' : undefined}
                    className={`nav-tab inline-block py-2 no-underline border-b-[3px] ${item.current ? 'border-heather text-ink font-semibold' : 'border-transparent text-muted hover:text-ink'}`}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>
    </header>
  );
};
