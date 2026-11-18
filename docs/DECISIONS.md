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
(6 November 2026).

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
map ([DATA.md](DATA.md#the-map)) (18 November 2026; awaiting the owner's confirmation).
