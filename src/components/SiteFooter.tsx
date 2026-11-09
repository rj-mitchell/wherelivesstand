// The foot of every page: the independence line, the standard links in the family's order, the map
// disclaimer and data date, then the family shelf.
import React from 'react';
import { Link } from '../lib/nav';
import { shelf } from 'virtual:family';
import { INDEPENDENCE_LINE, DATA_UPDATED, formatDate, REPO_URL } from '../config';

export const SiteFooter: React.FC = () => (
  <footer className="mt-16 no-print">
    <div className="max-w-page mx-auto px-4 md:px-8 py-8 border-t border-rule text-sm text-muted space-y-4">
      <p className="font-serif text-base text-ink">{INDEPENDENCE_LINE}</p>
      <nav aria-label="About this site">
        <ul className="flex flex-wrap gap-x-5 gap-y-1 [&_a]:inline-flex [&_a]:items-center [&_a]:min-h-6">
          <li><Link href="/about">About</Link></li>
          <li><Link href="/method">How it works</Link></li>
          <li><Link href="/corrections">Corrections</Link></li>
          <li><Link href="/accessibility">Accessibility</Link></li>
          <li><Link href="/privacy">Privacy</Link></li>
          <li><Link href="/terms">Terms</Link></li>
          <li><Link href="/press">Press</Link></li>
          <li><a href={REPO_URL}>Source code</a></li>
        </ul>
      </nav>
      <p>
        Data last updated {formatDate(DATA_UPDATED)}. Country names and the boundaries on the map are those of the
        sources and of Natural Earth; they do not imply any view on the status of a territory or its borders.
      </p>
      <p>
        Code licensed under the GNU Affero General Public License 3.0; the site's own text under CC BY 4.0. The
        figures remain their publishers'; see <Link href="/method">How it works</Link> for each source, and the{' '}
        <Link href="/terms">terms of use</Link>.
      </p>
    </div>
    {/* The family kit's shelf (public/family/shelf.html): every project, the charity line and its links */}
    <div className="wts-slot-shelf" dangerouslySetInnerHTML={{ __html: shelf }} />
  </footer>
);
