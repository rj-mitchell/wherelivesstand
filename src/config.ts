// Facts about the site used in more than one place.

export const SITE_NAME = 'Where Lives Stand';
export const SITE_URL = 'https://wherelivesstand.com';
export const TAGLINE = 'Quality of life, country by country';

/** Where readers write to; shown on the site. */
export const FEEDBACK_EMAIL = 'admin@wherelivesstand.com';
export const feedbackMailto = (subject = 'Where Lives Stand: a problem or a correction') =>
  `mailto:${FEEDBACK_EMAIL}?subject=${encodeURIComponent(subject)}`;

export const REPO_URL = 'https://github.com/rj-mitchell/wherelivesstand';
export const SOURCES_URL = `${REPO_URL}/blob/main/SOURCES.md`;

/** The date src/data was last rebuilt from the publishers' files. Change it with every data refresh. */
export const DATA_UPDATED = '2026-10-31';

/** The date the accessibility statement was last checked against the site. */
export const ACCESSIBILITY_CHECKED = '2026-11-06';

export const formatDate = (iso: string) =>
  new Date(`${iso}T12:00:00Z`).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });

/**
 * Measurement for Google Ad Grants (docs/DECISIONS.md, 19; the charity's family/MEASUREMENT.md), set at build time.
 * Off, as it ships: the pages are as they were, with no script, no banner and nothing from Google, and the content
 * security policy (public/_headers) allows nothing from other sites. Turned on, with the Google tag's ID from the
 * charity's Google Ads account, only once the charity is registered: then every page loads the family kit's
 * measure.js, which asks the reader first and loads the Google tag only if they accept; the footer gains
 * "Measurement choices"; the privacy page is the measurement version; and the build adds the Google tag's hosts to
 * the policy (scripts/postbuild.mjs, from public/family/measure-csp.json). Change it here, in a pull request: the
 * merge publishes it.
 */
export const ADS: { measurement: boolean; tag: string } = { measurement: false, tag: '' };

/** The Google tag's ID if measurement is on with a valid tag, else '' (off). */
export const measureTag = (ads: { measurement: boolean; tag: string } = ADS): string =>
  ads.measurement && /^(AW|G|GT)-[A-Za-z0-9]+$/.test(ads.tag) ? ads.tag : '';

/** The conversions this site has, for measure.js: a publisher's source opened, and the Donate link. */
export const MEASURES = 'source_opened donate_click';

export const INDEPENDENCE_LINE =
  'Where Lives Stand is independent. It is not affiliated with or endorsed by any of the publishers whose figures it uses.';
