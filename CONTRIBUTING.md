# Contributing

How to set up, check and submit a change to Where Lives Stand. To report a wrong figure or a problem with the site,
the quickest route is the [corrections page](https://wherelivesstand.com/corrections). Issues and pull requests on
GitHub are also welcome.

## Setting up

Install and run the site as in the README's [quick start](README.md#quick-start). Changing the dataset also needs
Python 3; see [docs/DATA.md](docs/DATA.md).

## Checks

Run the same checks as CI before opening a pull request:

```bash
npm run typecheck     # TypeScript
npm test              # scoring, addresses, the mark, the map geometry, and the figures quoted on Behind the rankings
npm run check:family  # the family kit copy in public/family/ is present and unedited
npm run build         # writes the site to dist/
npm run check:a11y    # accessibility and smoke checks of dist/ in Chromium
```

`check:a11y` needs a browser: run `npx playwright install chromium` once, or set `CHROME_PATH` to an installed
Chrome. [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) says what each check covers.

After a change to the data or to the text on Behind the rankings, `npm test` checks every figure the page quotes. A
change to an address needs `src/lib/url.ts`, `test/url.test.ts` and [docs/URLS.md](docs/URLS.md) updated together.

## Style

- Write in plain British English, in sentence case, with dates in the form 6 November 2026.
- Site text follows the Where They Stand family glossary (`family/GLOSSARY.md` in the charity's private
  repository).
- Don't edit `public/family/`; it is a copy of the family kit (see [docs/DESIGN.md](docs/DESIGN.md)).
- Don't edit `SOURCES.md` or `src/data/*.json` by hand; `scripts/build_dataset.py` generates them.
- Keep comments short and about the code as it is.

## Commit messages

Write a short summary line in plain words, then, if needed, a few sentences on what changed and why.

## Licence

Contributions are accepted under the same licences as the rest of the project: code under the AGPL-3.0 and text under
CC BY 4.0, as set out in the [README](README.md#licence).
