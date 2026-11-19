// The static HTML for every address: the app itself, rendered once at build time for the balanced weights and the
// whole world. scripts/postbuild.mjs writes it into each page's #root, so that search engines, link previews and
// readers without JavaScript get the page's text and figures, and src/main.tsx replaces it, in the same layout,
// once the figures have loaded. Built by `vite build --ssr` into dist-ssr/, which is not deployed.
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import App from './App';
import { Prerendering } from './lib/prerendering';
import { computeRankings, defaultWeights } from './lib/scoring';
import { DATA_UPDATED } from './config';
import type { CountryData, IndicatorMeta } from './types';
import rawCountries from './data/countries.json';
import rawIndicators from './data/indicators.json';

const countries = rawCountries as unknown as Record<string, CountryData>;
const indicators = rawIndicators as unknown as IndicatorMeta[];

/** The scores and ranks the static HTML shows: the balanced weights, as a plain link to any page has them. */
export const rankings = computeRankings(countries, indicators, defaultWeights());
export { countries, indicators, DATA_UPDATED };
export { ordinal } from './lib/scoring';

/**
 * The HTML that goes inside #root for an address. `lean` leaves out the weights and the table behind a dossier or
 * the comparison (App.tsx). The content security policy (public/_headers) allows no inline styles, so the few the
 * app sets (the dials' fill, the map legend's scale) are left out: the dials' fill falls back to 50%, as for the
 * balanced weights, and index.css hides the legend's scale until the app draws it.
 */
export function render(pathname: string, { lean = false } = {}): string {
  const html = renderToStaticMarkup(
    <Prerendering.Provider value={true}>
      <App countries={countries} location={{ pathname, search: '' }} lean={lean} />
    </Prerendering.Provider>,
  );
  return html.replace(/ style="[^"]*"/g, '');
}
