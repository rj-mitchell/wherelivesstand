# Design

Where Lives Stand is a volume in the Where They Stand family's Bound Volume style (the charity's
`brand/README.md`): ivory paper, ink, gilt rules, Source Serif 4, and heather (`#5E3F63`), its cloth, as the one
accent. It is a printed record, not a dashboard: square corners, rules rather than shadows and cards, small
capitals for labels, and no emoji or decorative icons.

## The family kit

The binding every Where They Stand site shares comes from the charity's family kit, copied into `public/family/`
(kit 1.1.0) and committed. Don't edit those files: change the kit and sync again.

```bash
node ../wheretheystand-charity/family/kit/sync.mjs --site lives --out public/family           # update
node ../wheretheystand-charity/family/kit/sync.mjs --site lives --out public/family --check   # verify
```

- `head.html` goes into every page's `<head>` at build time (`vite.config.ts`): the favicons, `theme-color`, the
  kit's stylesheets and Source Serif 4, and the link-preview card.
- `endorsement.html` (the spine and "A Where They Stand project") sits under the site's name in the masthead, and
  `shelf.html` (every project, the charity line, Donate) at the foot of every page. The app gets both as strings from
  the virtual module `virtual:family`.
- `<body class="wts-headings">` sets headings in Source Serif 4. `scripts/postbuild.mjs` copies
  `family/favicon.ico` to `/favicon.ico`.

## The mark

The site's picture mark sits beside its name in the masthead, as each sister site's does (Where MPs Stand's open
book, Where Countries Stand's horseshoe of seats, Where Landlords Stand's roof over a book). It is **a desk globe on
its stand**: an ivory globe with a graticule, its parallels curved so that it reads as round, held in a gilt
meridian ring on a gilt stand, on a rounded heather tile with a fine gilt edge. Three of the globe's cells are
shaded in heather, pale to dark, as countries are on the map: quality of life, country by country, and a world
that "stands".

- **Colours:** the tile is heather `#5E3F63` (in dark mode `#7F5585`, the family kit's lifted cloth, so that it
  stands clear of the dark page); the edge, ring and stand are the kit's spine gilt `#D9BC72`; the globe is ivory
  `#F3EAD6`, as Where MPs Stand's book; the graticule is heather, and the cells `#DCCADD`, `#B99CBD` and `#8A6590`.
  In forced colours the tile and globe are drawn in `Canvas` and everything else in `CanvasText` (`src/index.css`).
- **Drawing:** `scripts/mark.mjs` draws it on a 64-unit grid and writes `public/mark.svg` and `mark-dark.svg` (for
  40 pixels and up), `mark-small.svg` and `mark-small-dark.svg` (for 16 to 32 pixels: no gilt edge or shaded cells,
  fewer and heavier lines, on a 4-unit grid so that the stem and ring land on whole pixels at 16), and, with
  `--png`, `mark-512.png`. `src/components/Mark.tsx` draws the same shapes in the page, and `test/mark.test.ts`
  checks that the files are what the script draws and that the component agrees. Change the script, not the files.
- **In the masthead:** 56 pixels at desktop and 52 on phones, as tall as the name and the endorsement together, so
  the masthead is no taller and the map's top edge stays where [DECISIONS.md](DECISIONS.md), 6, puts it. It links
  home, like the name, but is hidden from screen readers and takes no focus, so the name is announced once.
- **Press:** `/press` lists the mark's files beside the family icon and the sharing image.
- **Favicons and link card:** since the family kit 1.1.0 they show the mark (family decision 4, amended at the
  owner's request on 6 November 2026): the kit draws `icon.svg` and the 16, 32 and 48 pixel icons from
  `mark-small.svg`, and the 180 and 512 pixel icons and the link card from `mark.svg`, from copies in the charity's
  `brand/assets/marks/lives/`. When the mark changes, copy the new files there and rebuild the kit; don't edit
  `public/family/` here.

## Type

- **Source Serif 4** (from the kit) for the name, headings and running text on the text pages.
- **Source Sans 3** (`src/fonts/`) for controls, tables and figures, with tabular numerals.
- Nothing smaller than 13px (`tailwind.config.js` sets the scale).

Both are served from this site; nothing is loaded from Google or any other host.

## Colour

Tokens are CSS variables in `src/index.css`, with a dark-mode value for each, following the system setting.

| Token | Light | Dark | Use |
|---|---|---|---|
| paper | `#F5F0E3` | `#181B1D` | Page |
| sheet | `#FBF8F0` | `#1F2326` | Panels, the sea on the map |
| ink | `#1C2427` | `#EDE6D3` | Text |
| ink-muted | `#42484D` | `#BEB7A5` | Secondary text |
| rule | `#CDBF9C` | `#585242` | Rules and borders |
| gilt | `#B08D3C` | `#B08D3C` | Decorative rules only |
| gilt-text | `#7A5C1C` | `#D9BC72` | Small-capital labels |
| heather | `#5E3F63` | `#C7AACC` | Links, selected controls, focus |
| compare-a / compare-b | heather / gilt-text | the same, lifted | The two countries in a comparison |

## The map and rankings view

The map comes first ([DECISIONS.md](DECISIONS.md), 6). Above it there are only the one-line beta banner, the
compact masthead (the name and endorsement, the navigation and the search, on one row from 1280 pixels wide;
below that, where the three would not fit without hiding some of the navigation, the navigation has a row of its
own, which scrolls sideways on a phone and fades at the end with more off screen) and the region
tabs and zoom buttons, in one row that scrolls sideways on a phone. Where more tabs lie off either end of the
row, that end fades out under an arrow, which scrolls the row along when tapped, and the chosen region's tab is
always scrolled into view; on a wide screen every tab fits and neither shows. The page's heading is visually hidden. The
count of countries, the data date and "Copy a link to this view" sit under the map; the weights are beside it at
desktop and under it on phones. In the page the map and the table come first and the weights after them, as on a
phone's screen; from 1024 pixels wide the grid places the weights in the left-hand column, sticky and as tall as the
map's foot (`App.tsx` measures it). The map has two skip links, shown when focused: to the table and to the weights.

The table of rankings scrolls sideways where it is wider than its column (on a phone or tablet, and beside the weights on a
laptop narrower than about 1400 pixels). Its rank and country columns stay pinned at the start on their row's own background (paper,
or the selected or hovered row's), with a rule at their edge once other columns have scrolled under them, so the
country stays in view; the fade marks only the far end.

The dossier and the comparison are modal: while one is open, everything else on the page is `inert` (out of reach
of Tab, a screen reader's virtual cursor and the pointer), Tab stays inside it, Escape closes it and focus goes back
where it was.

## The map

- **Projection:** Mercator, by the owner's choice ([DECISIONS.md](DECISIONS.md), 5), so that small, densely
  populated countries such as Europe's are big enough to see and select. Antarctica, Greenland and the far-northern
  Arctic islands (Svalbard, and every Russian and Canadian island lying wholly north of about 66°N, such as Novaya
  Zemlya, the New Siberian Islands and Canada's Arctic archipelago) are left out of the geometry, `src/data/world-50m.json`, because Mercator makes them enormous; that file is the one
  the site used before the redesign, and `test/map.test.ts` checks they stay out. The world view is 960 by 520,
  scale 150, rotated 10.6° so the land is centred; the regional views are in `src/data/regions.ts`.
- **Scale:** one hue, heather, by lightness (`src/lib/colour.ts`). On paper, low scores are pale and high scores
  dark; in dark mode the anchor flips. Order reads from lightness alone, so it holds for any colour vision. The
  seven sample steps were checked for monotone lightness, step separation and contrast with the surface in both modes.
  The world scale runs from 20 or less to 90 or more; in a region it can be stretched over that region's range.
- **Legend:** drawn by sampling the same function, with ticks where those scores fall, so it cannot disagree with
  the map.
- **Not ranked:** a hatched pattern, distinct from every step of the scale.
- **Keyboard:** every country in the data is a button with its name, score and rank, and Tab goes through them from A to Z; Enter opens the dossier;
  focus draws an ink outline and shows the hover card. A country drawn smaller than 2 pixels each way at the
  current zoom and width (Vatican City, Monaco or Nauru on the whole world, and more of the smallest on a phone)
  is left out of the Tab order, since focus there would show nothing; zooming in brings it back, and every
  country is in the search and the table. A skip link goes to the table, which lists every ranked country and
  sorts by any column.
- **Outlines:** the hovered, selected and focused countries' outlines are drawn again over the whole map, so a
  neighbour drawn after them (the countries are drawn from A to Z) never covers part of the outline.
