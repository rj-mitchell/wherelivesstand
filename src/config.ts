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

export const INDEPENDENCE_LINE =
  'Where Lives Stand is independent. It is not affiliated with or endorsed by any of the publishers whose figures it uses.';
