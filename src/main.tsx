import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import type { CountryData } from './types';
import countriesUrl from './data/countries.json?url';
import './index.css';

// The country figures are a separate, long-cached file (about 1.4 MB before compression), fetched in
// parallel with the app rather than built into it.
const root = ReactDOM.createRoot(document.getElementById('root')!);

fetch(countriesUrl)
  .then(r => {
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    return r.json() as Promise<Record<string, CountryData>>;
  })
  .then(countries =>
    root.render(
      <React.StrictMode>
        <App countries={countries} />
      </React.StrictMode>,
    ),
  )
  .catch(() => {
    const status = document.getElementById('boot-status');
    if (status) status.textContent = 'The figures could not be loaded. Check your connection and reload the page.';
  });
