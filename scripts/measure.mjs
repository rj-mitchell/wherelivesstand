// The measurement switch in the build (src/config.ts, ADS; docs/DECISIONS.md, 19), used by scripts/postbuild.mjs.
// Plain Node with no dependencies, so that it runs in Cloudflare's build, and its tests (test/measure.test.ts) run
// without a build.
//
// Off, as it ships, none of these is used and the build is as it was. On, with the Google tag's ID:
// - every page's <head> loads the family kit's measure.js with the tag (measureScript, withMeasure);
// - dist/_headers' content security policy adds the hosts the Google tag needs, from the kit's measure-csp.json
//   (measuredHeaders), and nothing else;
// - the privacy page must be the finished measurement version: draftProblems lists what is still a placeholder.

const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');

/** The kit's consent banner and Google tag loader, for a page's <head>. */
export const measureScript = (tag, measures) =>
  `<script src="/family/measure.js" data-tag="${esc(tag)}" data-privacy="/privacy" data-measures="${esc(measures)}" defer></script>`;

/** A page with measure.js added at the end of its <head>. */
export function withMeasure(html, tag, measures) {
  if (!html.includes('</head>')) throw new Error('measure: a page has no </head>');
  return html.replace('</head>', `  ${measureScript(tag, measures)}\n  </head>`);
}

/** A content security policy with the kit's hosts added to each directive it names (one the policy lacks starts
 * from 'self', as default-src gave it). */
export function measuredCsp(policy, hosts) {
  const directives = policy.split(';').map(d => d.trim()).filter(Boolean);
  for (const [name, list] of Object.entries(hosts)) {
    if (!Array.isArray(list)) continue;
    const at = directives.findIndex(d => d.split(/\s+/)[0] === name);
    if (at === -1) directives.push([name, "'self'", ...list].join(' '));
    else directives[at] = [directives[at], ...list].join(' ');
  }
  return directives.join('; ');
}

/** The _headers file with every Content-Security-Policy line given the kit's hosts. */
export function measuredHeaders(text, hosts) {
  let found = 0;
  const out = text.replace(/^(\s+Content-Security-Policy:\s*)(.+)$/gm, (_, lead, policy) => {
    found++;
    return lead + measuredCsp(policy, hosts);
  });
  if (!found) throw new Error('measure: _headers has no Content-Security-Policy');
  return out;
}

/** What is still a placeholder in the measurement version of the privacy notice. */
export const draftProblems = html =>
  [/NNNNNNN/.test(html) && 'it still says NNNNNNN for the charity number', /\(draft\b/.test(html) && 'its date still says draft'].filter(Boolean);
