// The foot of every page: the family shelf, then the site's own links in the family's order and one paragraph of
// notices. Terms, press and the other pages are linked from About.
import React from 'react';
import { Link } from '../lib/nav';
import { shelf } from 'virtual:family';
import { DATA_UPDATED, formatDate, REPO_URL } from '../config';

export const SiteFooter: React.FC = () => (
  <footer className="mt-16 no-print">
    {/* The family kit's shelf (public/family/shelf.html): every project, the charity line and its links */}
    <div className="wts-slot-shelf [&_.wts-shelf]:mt-0" dangerouslySetInnerHTML={{ __html: shelf }} />
    <div className="bg-panel text-muted text-sm">
      <div className="max-w-page mx-auto px-4 md:px-8 pb-7">
        <nav aria-label="About this site">
          <ul className="flex flex-wrap gap-x-5 [&_a]:inline-flex [&_a]:items-center [&_a]:min-h-6 [&_a]:text-ink">
            <li><Link href="/about">About</Link></li>
            <li><Link href="/method">Methodology</Link></li>
            <li><Link href="/corrections">Corrections</Link></li>
            <li><Link href="/accessibility">Accessibility</Link></li>
            <li><Link href="/privacy">Privacy</Link></li>
            <li><a href={REPO_URL}>Source code</a></li>
          </ul>
        </nav>
        <p className="mt-2 max-w-prose">
          Independent. Not affiliated with any of the publishers whose figures it uses. Data last updated{' '}
          {formatDate(DATA_UPDATED)}. Code under the GNU Affero General Public License 3.0, the site's own text under CC
          BY 4.0, and each figure under its publisher's terms. Country names and map boundaries are those of the sources
          and of Natural Earth, and imply no view on the status of any territory or border.
        </p>
      </div>
    </div>
  </footer>
);
