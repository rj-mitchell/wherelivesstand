# Addresses

Every view of Where Lives Stand has an address, so it can be linked to, bookmarked and shared, and the browser's
Back button works. The address bar always holds the current view; "Copy a link to this view" copies it.
`src/lib/url.ts` reads and writes these addresses and `test/url.test.ts` checks them; change all three together.

## Linking to a country (for sister sites)

```
https://wherelivesstand.com/country/GBR
```

The code is the ISO 3166-1 alpha-3 code, in capitals. This is the canonical form: it has its own page on the server
(`dist/country/GBR.html`, with the country's name in the title and link preview) and opens that country's dossier
over the map. Other forms are accepted and rewritten to it:

| Address | Goes to |
|---|---|
| `/country/gbr` | `/country/GBR` (301, from the server) |
| `/?country=GBR` | `/country/GBR` (rewritten in the browser) |
| `/country/FRO`, a territory | `/country/DNK`, the country it belongs to (302): territories are not ranked separately |
| `/country/ZZZ`, a code the data does not have | "Page not found", status 404 |

## Links to sister sites

Each country's page links to that country on Where Countries Stand. That site has no country pages (17 November
2026), so the link is a sources-only search for the country's name (`countriesHref` in
`src/components/CountryDossier.tsx`). When Where Countries Stand has country pages, the maintainer points the link
at them.

## Pages

| Address | Shows |
|---|---|
| `/` | The map, the weights and the table of rankings |
| `/country/NOR` | The same, with Norway's dossier open |
| `/compare?a=ESP&b=NOR` | The same, with Spain and Norway compared (`a` and `b` are ISO3 codes) |
| `/behind-the-rankings` | The limits of the indices (sections `#traps`, `#odd-results`, `#every-index`, `#your-weights`) |
| `/about`, `/method`, `/privacy`, `/terms`, `/accessibility`, `/corrections`, `/press` | The standard pages |
| anything else | "Page not found", status 404 |

## Weights and region

The map views (`/`, `/country/…`, `/compare`) carry the weights and region as query parameters. Each is left out
when it has its default value, so a plain link shows the balanced weights and the whole world.

| Parameter | Meaning | Example |
|---|---|---|
| `preset` | A preset's weights: `physical`, `institutional`, `remote-worker`, `young-family`, `rights` | `?preset=young-family` |
| `w` | The eight dimension weights, 0 to 100, separated by hyphens, in the order of the dials: safety, governance, rights, economy, health, infrastructure, climate, environment. Used when no preset matches | `?w=50-50-50-50-50-50-100-50` |
| `fine` | Per-indicator weights are on. Lists the indicators whose weight is not 50, as `id:weight`, separated by commas (ids from `src/data/indicators.json`) | `?fine=who_pm25:80,yale_epi:0` |
| `region` | Zoom the map and rank within a region: `europe`, `middle-east`, `north-america`, `south-america`, `asia`, `africa`, `oceania` | `?region=europe` |
| `scale` | In a region, `world` colours countries on the world scale instead of the region's own range | `?region=europe&scale=world` |

For example, `/country/FRA?preset=young-family&region=europe` opens France's dossier, with the Young family preset,
on a map of Europe.

## History

Opening a dossier or the comparison adds a history entry, so Back closes it. Moving a dial, choosing a preset or a
region updates the address in place, without adding entries. The text pages keep the reader's weights: going back
to the map restores them.

## How the server answers

`scripts/postbuild.mjs` writes an HTML file for every address above (`index.html`, `about.html`,
`country/NOR.html` and so on), plus `404.html`, `_redirects` and `sitemap.xml`. `wrangler.jsonc` serves
`404.html` with status 404 for anything without a file (`not_found_handling: "404-page"`), instead of the app with
status 200.
