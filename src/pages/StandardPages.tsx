// The standard pages every Where They Stand site carries: about, how it works, privacy, accessibility,
// corrections, press, and not found.
import React from 'react';
import { Page } from './Page';
import { Link } from '../lib/nav';
import { renderMarkdown } from '../lib/markdown';
import sourcesMd from '../../SOURCES.md?raw';
import {
  FEEDBACK_EMAIL,
  feedbackMailto,
  INDEPENDENCE_LINE,
  DATA_UPDATED,
  ACCESSIBILITY_CHECKED,
  formatDate,
  REPO_URL,
  SOURCES_URL,
  SITE_URL,
} from '../config';
const HUB_URL = 'https://wheretheystand.uk/';
const SISTERS = [
  { name: 'Where MPs Stand', url: 'https://wherempsstand.com' },
  { name: 'Where Councils Stand', url: 'https://wherecouncilsstand.com' },
  { name: 'Where Landlords Stand', url: 'https://wherelandlordsstand.com' },
  { name: 'Where Countries Stand', url: 'https://wherecountriesstand.com' },
];

const Email = () => <a href={feedbackMailto()}>{FEEDBACK_EMAIL}</a>;

// Who runs the site until the charity is registered, in the family's words (the family glossary, "Who runs it")
const RUNS_THE_SITES =
  'Where They Stand is applying to register as a charity in England and Wales. Until it is registered, the sites are run by its founder, Rob Mitchell, who is the data controller for the personal information described here. Once it is registered, the charity will be.';
const RUNS_THE_SITES_SHORT =
  'Where They Stand is applying to register as a charity in England and Wales; until then the site is run by its founder, Rob Mitchell.';
const TERMS_UPDATED = '2026-11-06';

export const About: React.FC<{ rankedCount: number; indicatorCount: number }> = ({ rankedCount, indicatorCount }) => (
  <Page title="About Where Lives Stand" kicker="About">
    <p className="text-lg">
      Where Lives Stand ranks {rankedCount} countries on quality of life, using {indicatorCount} indicators that
      others publish: the World Bank, the World Health Organization, the UN Development Programme, Transparency
      International, Reporters Without Borders, V-Dem, the Institute for Economics and Peace, Yale, Notre Dame, Ookla
      and others. You choose how much each of eight dimensions counts, and the map and the rankings follow.
    </p>
    <p>
      It collects no figures of its own. It rescales each publisher's figures to a common 0 to 100 scale, averages
      them within each dimension, and weights the dimensions as you set them. <Link href="/method">How it works</Link>{' '}
      gives the method and every source; <Link href="/behind-the-rankings">Behind the rankings</Link> sets out what the
      indices miss and where they lean.
    </p>
    <h2>Who runs it</h2>
    <p>
      Where Lives Stand is a project of <a href={HUB_URL}>Where They Stand</a>, which is applying to register as a
      charity in England and Wales. Until it is registered, the site is run by its founder, Rob Mitchell; once it is
      registered, the charity will run it. Until 6 November 2026 the site was called the Index of Indices.
    </p>
    <p>{INDEPENDENCE_LINE}</p>
    <h2>In the family</h2>
    <p>
      Where Lives Stand is a Where They Stand project. Its sister sites are{' '}
      {SISTERS.map((p, i) => (
        <React.Fragment key={p.url}>
          <a href={p.url}>{p.name}</a>
          {i < SISTERS.length - 2 ? ', ' : i === SISTERS.length - 2 ? ' and ' : ''}
        </React.Fragment>
      ))}
      ; the charity's own site is <a href={HUB_URL}>wheretheystand.uk</a>.
    </p>
    <h2>Linking to a country</h2>
    <p>
      Every country has its own address: <code>{SITE_URL}/country/</code> followed by its three-letter ISO 3166 code,
      such as <a href="/country/GBR">{SITE_URL}/country/GBR</a> for the United Kingdom. Weights, regions and
      comparisons can be shared too: the address bar always holds the current view.
    </p>
    <h2>Contact</h2>
    <p>
      For corrections, problems and questions, write to <Email />. See <Link href="/corrections">Corrections</Link>{' '}
      for what to include.
    </p>
    <h2>Licence</h2>
    <p>
      The code is open source under the GNU Affero General Public License 3.0, at <a href={REPO_URL}>GitHub</a>, and
      the site's own text is under CC BY 4.0. The figures are not covered by either licence: each belongs to its
      publisher and is used under the publisher's terms. See the <Link href="/terms">terms of use</Link>.
    </p>
  </Page>
);

export const Method: React.FC = () => (
  <Page title="How it works" kicker="Method and sources">
    <p className="text-lg">
      How the figures are chosen, scored and combined, and where each comes from. The rest of this page is generated
      with the dataset itself, from the same build that produces the figures (<a href={SOURCES_URL}>SOURCES.md</a>),
      and was last rebuilt on {formatDate(DATA_UPDATED)}.
    </p>
    <h2>The overall score</h2>
    <p>
      Each country's overall score is the weighted average of its eight dimension scores, using the weights you set
      (all 50% to begin with). A dimension a country lacks is left out, and the others share its weight. If you weight
      the indicators separately, each dimension becomes the weighted average of its indicators.
    </p>
    <p>
      The strengths and weaknesses in a country's dossier are the indicators with the most pull on its score: how far
      its world rank on each sits above or below the middle, times the share of the overall score that indicator
      carries under your weights. An indicator you weight at zero is never among them.
    </p>
    <h2>The colour scale</h2>
    <p>
      The map uses one hue, heather, from pale to dark (light to bright in dark mode), so the order can be read from
      lightness alone, whatever a reader's colour vision. On the world scale, 20 or less is the palest and 90 or more
      the darkest. In a region you can stretch the scale over that region's own range. The legend is drawn from the
      same scale as the map. The map uses the Mercator projection, so that smaller countries are large enough to see and
      select; it makes countries far from the equator look bigger than they are, and Antarctica, Greenland and the
      far-northern Arctic islands are left off it for that reason.
    </p>
    <div className="method-sources">{renderMarkdown(sourcesMd, { skipTitle: true })}</div>
  </Page>
);

export const Privacy: React.FC = () => (
  <Page title="Privacy" kicker="Privacy notice">
    <p className="text-lg">Where Lives Stand does not use cookies, analytics or advertising, and does not ask for any personal details.</p>
    <h2>What happens when you visit</h2>
    <p>
      The site is served by Cloudflare, Inc., which handles every request. Like any web server, Cloudflare receives your
      IP address and the details your browser sends (such as the page asked for and the browser's name), to deliver
      the page and to protect the site from attack. Cloudflare's privacy policy describes how it treats that
      information. We do not add analytics, and Where They Stand does not receive or keep a record of visits.
    </p>
    <p>
      The typefaces, the map and the figures all come from this site; nothing is loaded from Google or any other
      third party. Your weights and the country you are looking at are held in the page's address, not stored.
    </p>
    <h2>If you write to us</h2>
    <p>
      If you email <Email />, we keep your message and address only as long as we need them to deal with what you
      raised, and do not pass them on.
    </p>
    <h2>Who is responsible</h2>
    <p>
      Where Lives Stand is a Where They Stand project. {RUNS_THE_SITES} You can ask what we hold about you, or
      complain to the Information Commissioner's Office (ico.org.uk).
    </p>
  </Page>
);

export const Terms: React.FC = () => (
  <Page title="Terms of use" kicker="Terms">
    <p className="text-lg">
      The short version: use it freely, check the sources, and credit the site if you reuse its work.
    </p>
    <p className="text-sm text-muted">Last updated {formatDate(TERMS_UPDATED)}.</p>
    <h2>About these terms</h2>
    <p>
      Where Lives Stand (wherelivesstand.com) is a Where They Stand project. Where They Stand is applying to register as
      a charity in England and Wales. Until it is registered, the site is run by its founder, Rob Mitchell; once it is
      registered, the charity will run it. By using the site you agree to these terms. Contact: <Email />.
    </p>
    <h2>What the site is, and is not</h2>
    <p>
      The site shows figures published by others, such as the World Bank, the World Health Organization and the UN
      Development Programme, rescales them to a common scale and combines them under the weights you choose. Every
      figure carries its year and links to its publisher. Always check the source before relying on a figure.
    </p>
    <p>
      The scores and ranks are this site's arithmetic on those figures, not an official ranking by any publisher. They
      are general information, not advice on where to live, work, invest or travel.
    </p>
    <p>{INDEPENDENCE_LINE}</p>
    <p>The service is free and provided "as is". It may change, be paused or stop.</p>
    <h2>Reusing our work</h2>
    <p>
      The text the site writes (its pages, the method and Behind the rankings) is licensed under the{' '}
      <a href="https://creativecommons.org/licenses/by/4.0/">Creative Commons Attribution 4.0 International licence</a>{' '}
      (CC BY 4.0). You may copy, share and adapt it for any purpose, including commercially, as long as you credit
      Where Lives Stand, link to the page, and say if you changed it. For example: "From Where Lives Stand
      (wherelivesstand.com), CC BY 4.0."
    </p>
    <p>
      The code is open source under the <a href={`${REPO_URL}/blob/main/LICENSE`}>GNU Affero General Public License
      3.0</a>, at <a href={REPO_URL}>GitHub</a>. Anyone who runs a changed copy as a public website must offer its
      source code to that site's visitors.
    </p>
    <p>Other material is under its own terms:</p>
    <ul>
      <li>
        Each indicator's figures belong to its publisher and are used under that publisher's terms.{' '}
        <Link href="/method">How it works</Link> names the publisher of each indicator and links to its source (the
        same list is in <a href={SOURCES_URL}>SOURCES.md</a>). The scores and ranks are worked out from those figures,
        so check the publishers' terms before reusing them too.
      </li>
      <li>The map is drawn from Natural Earth, which is in the public domain.</li>
      <li>
        The name Where Lives Stand and its mark are not covered by these licences. Please don't use them in a way that
        suggests the site endorses you or your work.
      </li>
    </ul>
    <h2>Fair use of the service</h2>
    <p>
      Please don't send automated requests in bulk: every figure is in the <a href={REPO_URL}>repository</a>. Please
      don't try to break, overload or gain unauthorised access to the site, or present its figures as saying something
      they do not. Access may be limited or blocked to protect the service.
    </p>
    <h2>Responsibility</h2>
    <p>
      Every effort is made to keep the site accurate and fair, and our mistakes are corrected when found and listed on
      the <Link href="/corrections">corrections page</Link>. The site makes no promise that the figures are complete,
      correct or up to date. To the extent the law allows, Where They Stand is not liable for any loss arising from use
      of, or reliance on, the site. Nothing in these terms limits liability that cannot be limited by law.
    </p>
    <h2>Changes and law</h2>
    <p>
      These terms may be updated; the date above shows when. They are governed by the law of England and Wales, and
      the courts of England and Wales have jurisdiction, without affecting any rights you have where you live.
    </p>
  </Page>
);

export const Accessibility: React.FC = () => (
  <Page title="Accessibility statement" kicker="Accessibility">
    <p className="text-lg">
      We want everyone to be able to use Where Lives Stand. We aim to meet the Web Content Accessibility Guidelines
      (WCAG) 2.2 at level AA.
    </p>
    <h2>What you can do</h2>
    <ul>
      <li>Use the whole site with a keyboard. On the map, each country is a stop with its name and score; Enter opens its dossier. Links before the map skip straight to the table or to your weights.</li>
      <li>Read every figure on the map in the table of rankings below it, which you can sort by any column. On a phone the table scrolls sideways, and the rank and country stay in view.</li>
      <li>Close a dossier or the comparison with Escape; focus returns to where you were. While one is open, the rest of the page is out of reach, so a screen reader stays inside it.</li>
      <li>Read the map whatever your colour vision: the scale runs from pale to dark in one hue.</li>
      <li>Zoom the page to 200% and more, and use dark mode, which the site follows from your system.</li>
      <li>Copy any figure, name or source from the page.</li>
    </ul>
    <h2>How we tested it</h2>
    <p>
      On {formatDate(ACCESSIBILITY_CHECKED)} we checked the site with a keyboard alone, at phone and desktop widths, in
      light and dark mode, with reduced motion, and against the colour-contrast and colour-vision checks for the map
      scale. We have not yet tested it with screen-reader users or with an independent audit.
    </p>
    <h2>Known limits</h2>
    <ul>
      <li>The map has about two hundred keyboard stops, one per country. Use the skip links, the search box or the table to go straight to a country. Countries too small to see at the current zoom, such as Vatican City, are not keyboard stops until you zoom in; they are in the search and the table.</li>
      <li>The small territories and islands on the map are hard to hover or tap; they are all in the table and the search.</li>
      <li>The site needs JavaScript to work out the scores. Without it you see only the page titles.</li>
    </ul>
    <h2>Problems and feedback</h2>
    <p>
      If something does not work for you, email <Email /> and say what you were trying to do. We aim to reply within
      five working days. If you are not happy with our reply, you can contact the Equality Advisory and Support Service
      (EASS).
    </p>
  </Page>
);

export const Corrections: React.FC = () => (
  <Page title="Corrections and problems" kicker="Corrections">
    <p className="text-lg">
      If a figure looks wrong, a source is out of date, or something on the site does not work, tell us at <Email />.
    </p>
    <h2>What to include</h2>
    <ul>
      <li>the address of the page (it holds your weights and the country, so we see what you saw);</li>
      <li>what looks wrong, and what you expected;</li>
      <li>for a figure, where you found the right one, with a link if you can.</li>
    </ul>
    <h2>What we do</h2>
    <p>
      We check every report against the publisher's own release. Where we got something wrong, we correct it and
      record the correction here. Where the publisher's figure is what is wrong, we tell the publisher and leave the
      figure as they published it until they correct it, so the site stays a faithful record of their releases.
    </p>
    <p>
      Every figure is rebuilt from the publishers' files when the data is refreshed. The data was last refreshed on{' '}
      {formatDate(DATA_UPDATED)}. The full history of changes is in the <a href={`${REPO_URL}/commits/main`}>project's history on GitHub</a>.
    </p>
    <h2>Corrections made</h2>
    <p>None recorded yet.</p>
  </Page>
);

export const Press: React.FC<{ rankedCount: number; indicatorCount: number }> = ({ rankedCount, indicatorCount }) => (
  <Page title="Press and citing" kicker="Press">
    <p className="text-lg">
      Where Lives Stand ranks {rankedCount} countries on quality of life from {indicatorCount} published indicators,
      under weights the reader chooses. This page is for journalists, researchers and anyone quoting the site.
    </p>
    <h2>Contact</h2>
    <p>
      Email <a href={`mailto:${FEEDBACK_EMAIL}?subject=${encodeURIComponent('Where Lives Stand: press')}`}>{FEEDBACK_EMAIL}</a>{' '}
      for press, research or anything else. To report a figure that looks wrong, please follow{' '}
      <Link href="/corrections">Corrections</Link>, so that the correction is checked and recorded.
    </p>
    <h2>How to cite</h2>
    <p>
      Every figure on the site comes from a publisher, such as the World Bank or the World Health Organization. Where
      you can, quote and cite the publisher's own figure: each country's dossier gives every indicator's publisher and
      year, and <Link href="/method">How it works</Link> links to each source.
    </p>
    <p>
      The scores and ranks are the site's own arithmetic, and <strong>they change with the weights</strong>: the same
      country can rank very differently under another preset. So say which weights you used, or cite the link, which
      holds them. A country's address with no weights in it, such as <a href="/country/NOR">{SITE_URL}/country/NOR</a>,
      uses the balanced weights (every dimension at 50%). "Copy a link to this view", under the map, copies the address
      with your weights, region and the country you have open.
    </p>
    <p>To cite a country's figures:</p>
    <blockquote className="cite-template">
      Where Lives Stand (2026). "Norway". Quality-of-life score and rank under the balanced weights.{' '}
      {SITE_URL}/country/NOR (data updated {formatDate(DATA_UPDATED)}; accessed 6 November 2026).
    </blockquote>
    <p>With other weights, name them and give the link that holds them:</p>
    <blockquote className="cite-template">
      Where Lives Stand (2026). "Norway". Quality-of-life score and rank under the Young family weights.{' '}
      {SITE_URL}/country/NOR?preset=young-family (data updated {formatDate(DATA_UPDATED)}; accessed 6 November 2026).
    </blockquote>
    <p>
      The site's own text is licensed under CC BY 4.0; the figures stay under their publishers' terms. See the{' '}
      <Link href="/terms">terms of use</Link>.
    </p>
    <h2>The site in brief</h2>
    <ul>
      <li>
        {rankedCount} countries ranked on {indicatorCount} indicators in eight dimensions: safety, governance, rights,
        economy, health, infrastructure, climate and environment.
      </li>
      <li>
        A country is ranked only if it has at least 20 of the {indicatorCount} indicators. Nothing is imputed: a
        country a source does not cover shows "n/a" for it.
      </li>
      <li>
        Data last updated {formatDate(DATA_UPDATED)}. Every source, with its publisher, year and coverage, is listed in{' '}
        <Link href="/method">How it works</Link> and in <a href={SOURCES_URL}>SOURCES.md</a>.
      </li>
      <li>
        Its limits, and the traps in combining indices, are set out in{' '}
        <Link href="/behind-the-rankings">Behind the rankings</Link>.
      </li>
      <li>
        A Where They Stand project. {RUNS_THE_SITES_SHORT} No advertising, no analytics and no cookies. See{' '}
        <Link href="/about">About</Link>.
      </li>
    </ul>
    <p>{INDEPENDENCE_LINE}</p>
    <h2>Logo and images</h2>
    <p>
      You may use these to refer to the site. Please do not change them or use them in a way that suggests the site
      endorses you or your work.
    </p>
    <ul>
      <li>
        <a href="/mark.svg">The site's mark (SVG)</a>: a desk globe on its stand, on heather, as beside the name at
        the top of every page; <a href="/mark-dark.svg">for dark backgrounds (SVG)</a>, and{' '}
        <a href="/mark-512.png">as a picture, 512 by 512 pixels (PNG)</a>
      </li>
      <li>
        <a href="/mark-small.svg">The mark for small sizes (SVG)</a>, 16 to 32 pixels: the same globe, simpler
      </li>
      <li>
        <a href="/family/icon.svg">Icon (SVG)</a>: the browser-tab icon from the Where They Stand family kit, the mark
        for small sizes
      </li>
      <li>
        <a href="/family/icon-512.png">Icon (PNG, 512 pixels)</a>
      </li>
      <li>
        <a href="/family/card.png">Sharing image (PNG, 1200 by 630 pixels)</a>: the card shown when the site is linked
        to
      </li>
    </ul>
    <p className="flex flex-wrap items-end gap-6">
      <img src="/mark.svg" width={64} height={64} alt="The Where Lives Stand mark: a desk globe on its stand, in gilt, on a heather tile" />
      <img src="/family/icon.svg" width={64} height={64} alt="The Where Lives Stand icon: the desk globe, simpler, on heather" />
      <img
        src="/family/card.png"
        width={240}
        height={126}
        alt="The Where Lives Stand sharing image: the mark, the name and A Where They Stand project"
        className="border border-rule"
      />
    </p>
  </Page>
);

export const NotFound: React.FC<{ mapHref: string }> = ({ mapHref }) => (
  <Page title="Page not found" kicker="Not found">
    <p className="text-lg">There is no page at this address. It may have been mistyped, or it may have moved.</p>
    <p>
      Try the <Link href={mapHref}>map and rankings</Link>, or find a country with the search above. A country's page is
      at <code>/country/</code> followed by its three-letter code, such as <a href="/country/NOR">/country/NOR</a>.
    </p>
  </Page>
);
