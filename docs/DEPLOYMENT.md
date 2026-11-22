# Checks and deployment

What CI checks, what the maintainer checks before merging, and how the site reaches wherelivesstand.com.

## Continuous integration

GitHub Actions (`.github/workflows/ci.yml`) runs on every push and pull request. It runs `npm ci`, the type-check,
the tests, `npm run check:family` and the build, checks that the build wrote every page, runs `npm run test:build`
and then `npm run check:a11y`. It does not deploy anything.

`npm run test:build` (`test/build/`) checks `dist/`: that each country's page carries its name as its one h1 and
the score, rank, standouts, neighbours and indicator values the app works out for the balanced weights; that the home
page links to every country; that no page has an inline style, which the content security policy would block; and
the preloads, the sitemap's dates, the redirects and the structured data.

`npm run check:a11y` (`scripts/a11y.mjs`) serves `dist/` as the Worker does, with its 404 page and the headers in
`public/_headers`. It opens the home page, Norway's page, the comparison, Behind the rankings, About and Press in
Chromium, at 1280 and 390 pixels wide, in light and dark mode, both as the app and as the static HTML
each page carries until the app has loaded (with the app's script left out). It runs axe-core against WCAG 2.2 A and AA and fails on any serious
or critical finding, and on any console error, content security policy violation or request to another host.
`--shots <dir>` also saves a screenshot of each page.

`npm run check:family` checks the family kit copy in `public/family/` on its own: that `VERSION` is present, built
for this site, from the kit version the build expects (`KIT` in `scripts/check-family.mjs`), and that no file has been
edited since it was synced. Checking the copy against the kit itself needs the charity's repository, which is
private, so CI cannot do it.

## Before merging

The maintainer runs these from this repository, with the charity's repository (`wheretheystand-charity`) checked out
beside it:

```bash
node ../wheretheystand-charity/family/kit/sync.mjs --site lives --out public/family --check
npm run typecheck && npm test && npm run check:family && npm run build && npm run test:build && npm run check:a11y
npx wrangler dev   # serves dist/ as Cloudflare does; look at the changed pages, light and dark, desktop and phone
```

If the kit check fails, sync the kit ([DESIGN.md](DESIGN.md#the-family-kit)), commit the copies, and update `KIT` in
`scripts/check-family.mjs` if the kit's version has changed.

## Measurement

Measurement for Google Ad Grants ([DECISIONS.md](DECISIONS.md), 19; the charity's `family/MEASUREMENT.md`) is off:
`ADS` in `src/config.ts` is `{ measurement: false, tag: '' }`. Turn it on only once the charity is registered and
its Google Ads account has the conversions set up, in one pull request: finish `PrivacyMeasurement` in
`src/pages/StandardPages.tsx` (the charity number for `NNNNNNN`, and the date), set `ADS` to
`{ measurement: true, tag: 'AW-…' }`, run the checks above, and merge. The build then adds the kit's `measure.js` to
every page and the Google tag's hosts to `dist/_headers`, and refuses while the notice is unfinished. Cloudflare
serves the policy in `_headers` itself, so nothing else changes on the live side. Check in a private window: the
banner shows; "Reject" leaves no request to Google; "Accept" loads the tag; "Measurement choices" at the foot of a
page opens the banner again. To turn it off, set `ADS` back and merge.

## Deploying

Cloudflare Workers Builds is connected to this repository; GitHub Actions takes no part. Every push to `main` runs
`npm run build` and `npx wrangler deploy`, which publishes `dist/` to wherelivesstand.com. The Worker is named
`indexofindices`, the project's old name, and the `name` in `wrangler.jsonc` must match it.

Pushes to other branches, including pull-request branches, are built too, but run `wrangler preview` instead. It
uploads the build as a preview version with its own URL and leaves the live site unchanged. It refuses to run
without a `previews` block in `wrangler.jsonc`, which is why that file has an empty one.

`wrangler.jsonc` serves `dist/404.html` with status 404 for any address without its own file, and
`public/_headers` sets the security and caching headers.
