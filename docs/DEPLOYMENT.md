# Checks and deployment

What CI checks, what the maintainer checks before merging, and how the site reaches wherelivesstand.com.

## Continuous integration

GitHub Actions (`.github/workflows/ci.yml`) runs on every push and pull request. It runs `npm ci`, the type-check,
the tests, `npm run check:family` and the build, checks that the build wrote every page, and then runs
`npm run check:a11y`. It does not deploy anything.

`npm run check:a11y` (`scripts/a11y.mjs`) serves `dist/` as the Worker does, with its 404 page and the headers in
`public/_headers`. It opens the home page, Norway's page, the comparison, Behind the rankings, About and Press in
Chromium, at 1280 and 390 pixels wide, in light and dark mode. It runs axe-core against WCAG 2.2 A and AA and fails
on any serious or critical finding, and on any console error, content security policy violation or request to
another host. `--shots <dir>` also saves a screenshot of each page.

`npm run check:family` checks the family kit copy in `public/family/` on its own: that `VERSION` is present, built
for this site, from the kit version the build expects (`KIT` in `scripts/check-family.mjs`), and that no file has been
edited since it was synced. Checking the copy against the kit itself needs the charity's repository, which is
private, so CI cannot do it.

## Before merging

The maintainer runs these from this repository, with the charity's repository (`wheretheystand-charity`) checked out
beside it:

```bash
node ../wheretheystand-charity/family/kit/sync.mjs --site lives --out public/family --check
npm run typecheck && npm test && npm run check:family && npm run build && npm run check:a11y
npx wrangler dev   # serves dist/ as Cloudflare does; look at the changed pages, light and dark, desktop and phone
```

If the kit check fails, sync the kit ([DESIGN.md](DESIGN.md#the-family-kit)), commit the copies, and update `KIT` in
`scripts/check-family.mjs` if the kit's version has changed.

## Deploying

Cloudflare Workers Builds is connected to this repository; GitHub Actions takes no part. Every push to `main` runs
`npm run build` and `npx wrangler deploy`, which publishes `dist/` to wherelivesstand.com. The Worker is named
`indexofindices`, the project's old name, and the `name` in `wrangler.jsonc` must match it.

Pushes to other branches, including pull-request branches, are built too, but run `wrangler preview` instead. It
uploads the build as a preview version with its own URL and leaves the live site unchanged. It refuses to run
without a `previews` block in `wrangler.jsonc`, which is why that file has an empty one.

`wrangler.jsonc` serves `dist/404.html` with status 404 for any address without its own file, and
`public/_headers` sets the security and caching headers.
