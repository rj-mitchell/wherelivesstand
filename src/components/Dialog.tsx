// A modal dialog: the dossier slides in from the right, the comparison sits in the middle. Escape and
// the backdrop close it, Tab stays inside it, and focus goes back where it was when it closes.
import React, { useEffect, useRef } from 'react';
import { Icon } from './Icon';

interface Props {
  labelledBy: string;
  onClose: () => void;
  variant: 'sheet' | 'centre';
  closeLabel: string;
  children: React.ReactNode;
}

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea, [tabindex]:not([tabindex="-1"])';

export const Dialog: React.FC<Props> = ({ labelledBy, onClose, variant, closeLabel, children }) => {
  const panel = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const heading = panel.current?.querySelector<HTMLElement>(`#${CSS.escape(labelledBy)}`);
    (heading ?? panel.current)?.focus({ preventScroll: true });
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onCloseRef.current();
        return;
      }
      if (e.key !== 'Tab' || !panel.current) return;
      const items = Array.from(panel.current.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(el => el.offsetParent !== null);
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && (document.activeElement === first || !panel.current.contains(document.activeElement))) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = overflow;
      // Back where it was; for a dialog opened from its own address, to the map's heading rather than nowhere
      const back = previous && previous !== document.body && document.contains(previous) ? previous : document.getElementById('map-title');
      back?.focus({ preventScroll: true });
    };
  }, [labelledBy]);

  const frame =
    variant === 'sheet'
      ? 'fixed inset-y-0 right-0 w-full sm:w-[36rem] lg:w-[40rem] border-l border-rule sheet-in'
      : 'fixed inset-0 sm:inset-x-4 sm:inset-y-6 md:inset-y-10 mx-auto max-w-5xl sm:border border-rule';

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-ink/40" onClick={onClose} aria-hidden="true" />
      <div ref={panel} role="dialog" aria-modal="true" aria-labelledby={labelledBy} tabIndex={-1} className={`${frame} bg-paper flex flex-col outline-none`}>
        <button type="button" onClick={onClose} className="absolute top-3 right-3 z-10 btn w-11 min-h-[44px] px-0" aria-label={closeLabel} title={`${closeLabel} (Escape)`}>
          <Icon name="close" className="w-5 h-5" />
        </button>
        {children}
      </div>
    </div>
  );
};
