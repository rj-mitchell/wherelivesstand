# Where Lives Stand

[![CI](https://github.com/rj-mitchell/wherelivesstand/actions/workflows/ci.yml/badge.svg)](https://github.com/rj-mitchell/wherelivesstand/actions/workflows/ci.yml)

Where Lives Stand ranks 186 countries on quality of life, using 34 indicators published by the World Bank, WHO,
UNDP, Transparency International, Reporters Without Borders, V-Dem, the Institute for Economics and Peace, Yale,
Notre Dame, Ookla and others. Readers choose how much each of eight dimensions counts, and the map, the rankings and
each country's page follow. Every value links to its publisher and gives its year.

The site is live at [wherelivesstand.com](https://wherelivesstand.com). It is a project of Where They Stand, which is
applying to register as a charity in England and Wales ([wheretheystand.uk](https://wheretheystand.uk)). It is
independent and is not affiliated with or endorsed by any of the publishers whose figures it uses.

## Status

Beta, as of 17 November 2026: the site is live, but figures and methods may still change. Known limitations:

- The publishers' terms for the files in `data/sources/` are still being checked.
- The scores need JavaScript; without it, a page shows only its title and a link to the sources.
- Small territories are hard to pick out on the map, but they are all in the table and the search.
- Data years differ between indicators (2015 to 2026), and some figures are modelled estimates.

## What it does

- Weights: eight dimension sliders, six presets and an optional slider for each indicator.
- A world map and a sortable table of every ranked country, for the world or one region.
- A page for each country with its score and rank under the current weights, the indicators that lift and hold back
  that score, and every indicator with its value, year, world rank and publisher.
- A side-by-side comparison of any two countries.
- Behind the rankings, a page on the limits of the indices and the traps in combining them.

Every view has its own address, so it can be bookmarked and shared.

## How it works

The dataset is built offline. `scripts/build_dataset.py` reads the publishers' files kept in `data/sources/`, scores
each indicator from 0 to 100, and writes `src/data/*.json` and [SOURCES.md](SOURCES.md).

The site is a static React app (Vite, TypeScript and Tailwind CSS). The browser does the weighting and ranking
(`src/lib/scoring.ts`). After the Vite build, `scripts/postbuild.mjs` writes an HTML file for every address, a 404
page and a sitemap. Cloudflare Workers serves the result as static assets, and every push to `main` deploys it. The
header, footer, typefaces and icons come from the Where They Stand family kit, copied into `public/family/`.

## Quick start

This needs Node.js 22.18 or later (the version is in `.nvmrc`).

```bash
npm ci
npm run dev        # http://localhost:3000
npm test
npm run build      # writes the site to dist/
npm run preview    # serves dist/
```

[CONTRIBUTING.md](CONTRIBUTING.md) lists the checks to run before a pull request.

## Documentation

- [CONTRIBUTING.md](CONTRIBUTING.md): setting up, the checks, and the style for code and text
- [SOURCES.md](SOURCES.md): every indicator, with its publisher, years, coverage and goalposts (generated; also shown
  on the site's methodology page)
- [docs/DATA.md](docs/DATA.md): the scoring method and how to rebuild the dataset
- [docs/URLS.md](docs/URLS.md): the address of every view, and how to link to a country
- [docs/DESIGN.md](docs/DESIGN.md): the design, the family kit, the mark, the colours and the map
- [docs/DECISIONS.md](docs/DECISIONS.md): product decisions and their reasons
- [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md): continuous integration, checks before merging, and deployment

[docs/README.md](docs/README.md) says which of these to read first for each kind of reader.

## Data sources

Each indicator belongs to its publisher and is used under that publisher's terms. [SOURCES.md](SOURCES.md) lists
them all, with links, and the indicators that were considered and left out. `data/sources/` keeps a copy of each
file as downloaded so the dataset can be rebuilt exactly; those copies remain under their publishers' terms, and
any file whose terms do not allow redistribution will be removed and downloaded at build time instead.

The map is from Natural Earth (public domain), via the world-atlas package (ISC licence), with Crimea, Western
Sahara and the Golan Heights drawn as in Natural Earth's point of view for the UK
([docs/DECISIONS.md](docs/DECISIONS.md#16-boundaries-on-the-map)); `scripts/build_map.mjs` builds it. The typefaces are Source
Serif 4 and Source Sans 3 (SIL Open Font License).

To report a wrong figure, use the site's [corrections page](https://wherelivesstand.com/corrections).

## Licence

The code is licensed under the GNU Affero General Public License 3.0 ([LICENSE](LICENSE)). Anyone who runs a
modified copy as a public website must offer its source code to that site's visitors.

The text written for the site (its pages, the methodology and Behind the rankings) is licensed under Creative
Commons Attribution 4.0, as set out in the [terms of use](https://wherelivesstand.com/terms).

The name Where Lives Stand and the mark are not covered by either licence.
