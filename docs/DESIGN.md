# Design

How Where Lives Stand looks and why: the family kit, the mark, type, colour, the layout of the map view, and the
map itself.

Where Lives Stand uses the Where They Stand family's design: a white page, light grey panels, Source Serif 4 for
headings and Source Sans 3 for everything else. Each family site has its own cloth colour; this site's is heather
(`#5E3F63`), used for the header band, links, selected controls and the map. Corners are square or nearly so, and
there are no shadows, emoji or decorative icons.

## The family kit

The header endorsement, the footer shelf, the shared stylesheet, the typefaces and the icons come from the charity's
family kit, copied into `public/family/` and committed (the kit's version is in `public/family/VERSION`). Nobody
edits those files here: the maintainer changes the kit in the charity's repository and syncs again, from a checkout
of it beside this one.

```bash
node ../wheretheystand-charity/family/kit/sync.mjs --site lives --out public/family           # update
node ../wheretheystand-charity/family/kit/sync.mjs --site lives --out public/family --check   # verify
```

- `head.html` goes into every page's `<head>` at build time (`vite.config.ts`): the favicons, `theme-color`, the
  kit's stylesheets and fonts, and the link-preview card.
- `endorsement.html` (the spine and "A Where They Stand project") sits under the site's name in the header, and
  `shelf.html` (every project, the charity line and Donate) at the foot of every page. The app gets both as strings
  from the virtual module `virtual:family`.
- `<body class="wts-headings">` sets headings in Source Serif 4. `scripts/postbuild.mjs` copies
  `family/favicon.ico` to `/favicon.ico`.

## The mark

The site's picture mark sits beside its name in the header, as each sister site's does (Where MPs Stand's open
book, Where Countries Stand's horseshoe of seats, Where Landlords Stand's roof over a book). It is a desk globe on
its stand: an ivory globe with a graticule, its parallels curved so that it reads as round, held in a gilt meridian
ring on a gilt stand, on a rounded heather tile with a fine gilt edge. Three of the globe's cells are shaded in
heather, pale to dark, as countries are on the map.

- Colours: the tile is heather `#5E3F63` (`#7F5585` in dark mode, the kit's lifted cloth); the edge, ring and stand
  are the kit's spine gilt `#D9BC72`; the globe is ivory `#F3EAD6`; the graticule is heather, and the cells
  `#DCCADD`, `#B99CBD` and `#8A6590`. On the header band the tile takes the other of the two heathers so that it
  stands clear of the band. In forced colours the tile and globe are drawn in `Canvas` and everything else in
  `CanvasText` (`src/index.css`).
- Drawing: `scripts/mark.mjs` draws it on a 64-unit grid and writes `public/mark.svg` and `mark-dark.svg` (for 40
  pixels and up), `mark-small.svg` and `mark-small-dark.svg` (for 16 to 32 pixels, with no gilt edge or shaded
  cells, fewer and heavier lines, on a 4-unit grid so that the stem and ring land on whole pixels at 16), and, with
  `--png`, `mark-512.png`. `src/components/Mark.tsx` draws the same shapes in the page, and `test/mark.test.ts`
  checks that the files match the script's output and that the component agrees. To change the mark, change the
  script and run it again.
- In the header it is 56 pixels at desktop and 52 on phones, about as tall as the name and the endorsement
  together. It links home, like the name, but is hidden from screen readers and takes no focus, so the name is
  announced once.
- `/press` lists the mark's files beside the family icon and the sharing image.
- The favicons and link card show the mark. The kit draws `icon.svg` and the 16, 32 and 48 pixel icons from
  `mark-small.svg`, and the 180 and 512 pixel icons and the link card from `mark.svg`, using copies in the charity's
  `brand/assets/marks/lives/`. When the mark changes, copy the new files there and rebuild the kit; don't edit
  `public/family/` here.

## Type

- Source Serif 4 for the site's name and headings.
- Source Sans 3 for running text, controls, tables and figures, with tabular numerals in tables.
- Nothing smaller than 13px (the `@theme` block in `src/index.css` sets the scale).
- Running text on the text pages is held to 52rem (`.prose-page` in `src/index.css`).

Both typefaces come from the kit and are served from this site; nothing is loaded from another host.

## Colour

Colours are CSS custom properties in `src/index.css`, most of them taken from the kit's tokens
(`public/family/family.css`), so dark mode, which follows the system setting, swaps them in one place. Tailwind's
default palette is not included.

| Token | Light | Dark | Use |
|---|---|---|---|
| page | `#FFFFFF` | `#111517` | Page |
| panel | `#F2F4F4` | `#1A2023` | Panels and the footer shelf |
| ink | `#1C2427` | `#E6EAEA` | Text |
| ink-muted | `#4F5A5E` | `#A9B4B7` | Secondary text |
| rule, rule-faint | `#C4CBCD`, `#DFE4E5` | `#3D474B`, `#283034` | Rules and borders |
| band, on-band | `#5E3F63`, `#FFFFFF` | `#7F5585`, `#FFFFFF` | The header band and its text |
| heather | `#5E3F63` | `#D0ADD6` | Links, selected controls, focus |
| heather-strong, heather-tint | `#482E4C`, `#EFE7F0` | `#E6D3E9`, `#33283A` | Hover and pressed states, highlighted rows, selected text |
| compare-a, compare-b | heather, ink-muted | the same | The two countries in a comparison |

## The map and rankings view

The map comes first ([DECISIONS.md](DECISIONS.md#6-the-map-comes-first)). Above it there are only the header band,
the one-line beta banner, and one row with the region tabs and zoom buttons. The page's heading is visually hidden.
The count of countries, the data date and "Copy a link to this view" sit under the map.

- The header band holds the mark, the name and endorsement, the navigation and the search, on one row from 1280
  pixels wide. Below that the navigation has a row of its own, which scrolls sideways on a phone and fades at the
  end while more is off screen.
- The region row also scrolls sideways on a phone. Where more tabs lie off either end, that end fades out under an
  arrow that scrolls the row along when tapped, and the chosen region's tab is always scrolled into view. On a wide
  screen every tab fits and neither arrow shows.
- In the page's source order the map and the table come first and the weights after them, as on a phone's screen.
  From 1024 pixels wide the grid places the weights in the left-hand column, sticky and as tall as the map's foot
  (`App.tsx` measures it).
- The map has two skip links, shown when focused: to the table and to the weights.
- The map's hover card is as wide as its longest line, so no line wraps.

The weights panel has no introduction. Reset sits beside its heading, and the presets sit three to a row, each with
its summary in a tooltip that is also read out to screen readers. Each dimension's indicators open from a small
button beside its name, with a slider for each; moving one turns per-indicator weights on, so there is no separate
switch. The dimensions are spread evenly down to the map's foot, never shorter than their content.

The table of rankings scrolls sideways where it is wider than its column (on a phone or tablet, and beside the
weights on a laptop narrower than about 1400 pixels). Its rank and country columns stay pinned at the start on their
row's own background, with a rule at their edge once other columns have scrolled under them, so the country stays in
view; the fade marks only the far end.

The country page and the comparison are modal dialogs. While one is open, everything else on the page is `inert`
(out of reach of Tab, a screen reader's virtual cursor and the pointer), Tab stays inside it, Escape closes it and
focus returns to where it was.

## The map

- Projection: Mercator ([DECISIONS.md](DECISIONS.md#5-the-maps-projection)). Antarctica, Greenland and the
  far-northern Arctic islands are left out of the geometry, `src/data/world-50m.json`. These are Svalbard and every
  Russian and Canadian island lying wholly north of about 66°N, such as Novaya Zemlya, the New Siberian Islands and
  Canada's Arctic archipelago; `test/map.test.ts` checks they stay out. The world view is 960 by 520, scale 150,
  rotated 10.6° so that the land is centred; the regional views are in `src/data/regions.ts`.
- Scale: one hue, heather, by lightness (`src/lib/colour.ts`). In light mode low scores are pale and high scores
  dark; in dark mode the scale flips. Order reads from lightness alone, so it holds for any colour vision. The seven
  sample steps were checked for even lightness steps and contrast with the surface in both modes. The world scale
  runs from 20 or less to 90 or more; in a region it can be stretched over that region's range.
- Legend: drawn by sampling the same function, with ticks where those scores fall, so it cannot disagree with the
  map.
- Countries that are not ranked are hatched, in a pattern distinct from every step of the scale.
- Keyboard: every country in the data is a button with its name, score and rank, and Tab goes through them from A
  to Z; Enter opens the country's page, and focus draws an ink outline and shows the hover card. A country drawn
  smaller than 2 pixels each way at the current zoom and width (Vatican City, Monaco or Nauru on the whole world, and
  more of the smallest on a phone) is left out of the Tab order, since focus there would show nothing; zooming in
  brings it back, and every country is in the search and the table.
- The hovered, selected and focused countries' outlines are drawn again over the whole map, so that a neighbour
  drawn after them never covers part of the outline.
