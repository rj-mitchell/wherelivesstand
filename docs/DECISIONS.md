# Decisions

The product decisions behind Where Lives Stand: what was decided, why, and when. How each one is carried out is in
[DESIGN.md](DESIGN.md), [DATA.md](DATA.md) and [URLS.md](URLS.md). Add new decisions at the end with the next number,
and keep the numbers, since other documents refer to them.

All of them are confirmed by the project's owner.

### 1. Design

The site uses the Where They Stand family's design ([DESIGN.md](DESIGN.md)) and keeps every feature: the weights,
presets and per-indicator sliders, the map, the table, the country pages, the comparison and Behind the rankings
(6 November 2026).

### 2. Typefaces

Headings are set in Source Serif 4 and everything else in Source Sans 3, the family's typefaces, so that the
sister sites look alike (6 November 2026).

### 3. Licence for the code

AGPL-3.0, as for the sister sites ([LICENSE](../LICENSE)). The publishers' figures stay under their own terms, and the
name and mark are not covered (6 November 2026).

### 4. Name

Where Lives Stand, at wherelivesstand.com, a Where They Stand project (6 November 2026).

### 5. The map's projection

Mercator, so that small, densely populated countries such as those in Europe are large enough to see and select. An
equal-area projection was considered and set aside. Antarctica, Greenland and the far-northern Arctic islands are
left off the map because Mercator makes them enormous; Greenland is not in the data in any case (6 November 2026).

### 6. The map comes first

As little as possible sits above the map: the header band, a one-line beta banner and the region tabs, with no
visible heading or introduction. The weights sit beside the map on a laptop and under it on a phone, compact enough
that the panel's foot is level with the map's. [DESIGN.md](DESIGN.md#the-map-and-rankings-view) describes the
layout (6 November 2026, refined 8 November 2026).

### 7. Preset names

Two presets have plain names, Rights and liberties and Remote worker, written `rights` and `remote-worker` in
addresses (6 November 2026).

### 8. Territories

Territories of another country (the Faroe Islands, Jersey, Puerto Rico and the like) are not ranked separately,
because most sources report them under the country they belong to. On the map they are hatched and their hover card
says "not ranked separately"; selecting one, or opening its address, goes to the country it belongs to
(6 November 2026). Places that the publishers report separately, such as Hong Kong and Taiwan, are not territories
in this sense: decision 17 covers them.

### 9. The colour scale

One hue, heather, by lightness, so that the order reads from lightness alone whatever a reader's colour vision
([DESIGN.md](DESIGN.md#the-map)) (6 November 2026).

### 10. Country addresses

Every country has one canonical address, `/country/<ISO3>` with the code in capitals (`/country/GBR`). Other forms
are rewritten to it, and sister sites link to it ([URLS.md](URLS.md)) (6 November 2026).

### 11. No imputation

Nothing is imputed: a country a source does not cover shows "n/a" for that indicator, and observations older than
2015 are dropped ([DATA.md](DATA.md#method)) (recorded 6 November 2026).

### 12. Who is ranked

A country is ranked only if it has at least 20 of the 34 indicators. A dimension with fewer than half of its
indicators is left out of that country's score, so that no dimension rests on one value (recorded 6 November 2026).

### 13. V-Dem's religious-freedom score

Averaged over V-Dem's last three years (2023 to 2025), because it rests on a single question rated by a handful of
experts per country and moves a lot from year to year. It is the only averaged value (recorded 6 November 2026).

### 14. Licence for the site's own text

The text the site writes (its pages, the methodology and Behind the rankings) is licensed under CC BY 4.0, as on
Where MPs Stand and Where Landlords Stand, and stated on the terms page. The figures stay under their publishers'
terms, and the name and mark are not covered (6 November 2026).

### 15. The mark

The site has a picture mark beside its name, as its sister sites do: a desk globe on its stand, in gilt, on a heather
tile. It is no taller than the name and the endorsement, so that the map stays where decision 6 puts it. The favicons
show it too, and the press page offers it (6 November 2026; [DESIGN.md](DESIGN.md#the-mark)).

### 16. Boundaries on the map

The map follows Natural Earth's de facto boundaries at 1:50 million, except in three places, which are drawn as in
Natural Earth's point of view for the United Kingdom (version 5.1.1): Crimea is part of Ukraine; Western Sahara is one
area, apart from Morocco; and the Golan Heights are apart from Israel, an area of their own that is not ranked. That
point of view is not used whole: it is published only at 1:10 million, and it draws Kosovo as part of Serbia and
Abkhazia and South Ossetia apart from Georgia, neither of which is the UK's position. Elsewhere the de facto lines
stay, as they do in that point of view; Aksai Chin, for example, is drawn as part of China. Northern Cyprus and
Somaliland keep their own outlines but are counted with Cyprus and Somalia, so Northern Cyprus no longer has a page of
its own (`/country/CYN` goes to `/country/CYP`). The map's caption and the methodology say that the boundaries are
drawn for illustration and imply no view on the status of any territory or border. `scripts/build_map.mjs` builds the
map ([DATA.md](DATA.md#the-map)) (18 November 2026; confirmed by the owner on 19 November 2026).

### 17. Places reported separately

Places that the publishers report separately from the state that claims or governs them (Hong Kong, Macao, Taiwan,
Kosovo and Palestine) are shown as places of their own, with their own page, and are ranked like any country when
they have at least 20 of the 34 indicators (decision 12). A publisher's figure for one of them is used as the
publisher gives it, and never taken from the row of the state that claims or governs it. This differs from decision
8: territories such as the Faroe Islands, Jersey and Puerto Rico are reported by most publishers under the country
they belong to, so they stay unranked and open that country, while these places are reported apart and so are
treated apart. It follows how the publishers report and implies no view on any place's status, as with the map's
boundaries (decision 16). A place with too few indicators to be ranked still shows every figure that covers it
([DATA.md](DATA.md#method)) (19 November 2026).

### 18. If you're named

The site names no people: it names countries and the publishers whose figures it uses. So it has no separate "If
you're named" page. The family glossary's page is a section of the Corrections page, headed "If you're named"
(`/corrections#named`), with the routes "Errors" and "Unfair descriptions" and the response times in the glossary's
words, and About links to it as "If you're named on this site". The footer keeps the family's six links, so every
page reaches About, Methodology, Corrections, Accessibility and Privacy directly, and "If you're named" through
Corrections (the charity's review plan of 21 November 2026, C4) (21 November 2026).

### 19. Measurement for Google Ad Grants, built and switched off

The charity will apply for Google Ad Grants once it is registered, which needs the Google tag on the sites to count
conversions (the charity's review plan, Part D; its `family/MEASUREMENT.md`). It is built now and off, so the site is
what it was until the owner turns it on. The switch is `ADS` in `src/config.ts`, set at build time and changed in a
pull request, rather than an environment variable in Cloudflare's build settings, so that what is live is always
what the repository says. Off, the pages differ from before only in the kit's version and its inert
`data-wts-conversion` marks, and `public/_headers` is unchanged. On, `scripts/postbuild.mjs` adds the kit's
`measure.js` to every page's head and the kit's Google hosts to the policy in `dist/_headers`; the footer gains
"Measurement choices" on a line of its own after the notices (a control, not a page, so the footer keeps the
family's six links); the privacy page is the measurement version in the glossary's "once registered" words, which
the build refuses while it still says `NNNNNNN` or "(draft". What is measured: a publisher's source opened (an
indicator's publisher in a country's dossier, and each index's publisher on Behind the rankings) and the Donate link
in the kit's shelf. Nothing else: no page views, and never the weights or the countries looked at. The country and
comparison dialogs make the page behind them inert, so the banner moves to the top of an open dialog
(`data-wts-measure-slot`): a reader who lands on a country page can still reach it (21 November 2026).

### 20. Links to a place's page on Where Countries Stand

Where Countries Stand gave a page to each place in the UN's record on 22 November 2026 (its decision 29): the UN's
193 Member States, its two non-member observer States (the State of Palestine and the Holy See) and Kosovo. A place's
page here links to its page there, "Its statements and votes at the United Nations", in words that name no country,
because the two sites name some places differently (this site follows the publishers, "Palestine", "Vatican City";
that one the UN, "State of Palestine", "Holy See"). Places this site shows apart because the publishers report them
apart (decision 17) but that the UN's record does not treat as speakers (Hong Kong, Macao, Taiwan, Western Sahara),
and the Cook Islands and Niue, have no page there and so no link; before, every page linked to a search there for its
name, which on those pages promised statements that do not exist. Neither site's choice implies a view on any place's
status (22 November 2026).
