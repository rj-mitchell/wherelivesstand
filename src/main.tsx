import React from 'react';
import ReactDOM from 'react-dom/client';
import { flushSync } from 'react-dom';
import App from './App';
import type { CountryData } from './types';
import countriesUrl from './data/countries.json?url';
import './index.css';

// The country figures are a separate, long-cached file (about 750 kB before compression), fetched in parallel
// with the app rather than built into it. Until they arrive, the page shows its static HTML (scripts/postbuild.mjs,
// src/prerender.tsx), which the app then replaces in the same layout.
const container = document.getElementById('root')!;
const root = ReactDOM.createRoot(container);

fetch(countriesUrl)
  .then(r => {
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    return r.json() as Promise<Record<string, CountryData>>;
  })
  .then(countries => {
    // An open dossier or comparison keeps the place the reader had scrolled to in its static HTML
    const scrolled = [...container.querySelectorAll<HTMLElement>('[data-scroll]')].map(el => [el.dataset.scroll, el.scrollTop] as const);
    flushSync(() =>
      root.render(
        <React.StrictMode>
          <App countries={countries} />
        </React.StrictMode>,
      ),
    );
    container.removeAttribute('data-prerendered');
    for (const [name, top] of scrolled) {
      const el = container.querySelector<HTMLElement>(`[data-scroll="${name}"]`);
      if (el && top) el.scrollTop = top;
    }
  })
  .catch(() => {
    const status = document.getElementById('boot-status');
    if (status) status.textContent = 'The figures could not be loaded. Check your connection and reload the page.';
  });
