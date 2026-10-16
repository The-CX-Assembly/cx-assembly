'use client';

import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import JoinForm from './JoinForm';
import { captureAttribution } from '../utils/attribution';

const JoinModalContext = createContext<{ openJoin: (source: string) => void }>({ openJoin: () => {} });

/**
 * Site-wide community application popup. Any <JoinButton> opens it, and so does a URL
 * ending in #join (kept so older links and bookmarks still work). The button's
 * `source` is saved with the lead so the inbox shows which CTA converted.
 */
export function JoinModalProvider({ children }: { children: React.ReactNode }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [source, setSource] = useState<string | null>(null);
  const open = source !== null;

  const openJoin = useCallback((from: string) => setSource(from), []);
  const close = useCallback(() => setSource(null), []);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      dialog.showModal();
      requestAnimationFrame(() => dialog.querySelector<HTMLInputElement>('#fullName')?.focus());
    }
    if (!open && dialog.open) dialog.close();
  }, [open]);

  // Remember the campaign link this visit started from (the provider wraps every page).
  useEffect(() => {
    captureAttribution();
  }, []);

  useEffect(() => {
    const fromHash = () => {
      if (window.location.hash === '#join') {
        setSource('join-link');
        history.replaceState(null, '', window.location.pathname + window.location.search);
      }
    };
    fromHash();
    window.addEventListener('hashchange', fromHash);
    return () => window.removeEventListener('hashchange', fromHash);
  }, []);

  return (
    <JoinModalContext.Provider value={{ openJoin }}>
      {children}

      <dialog
        ref={dialogRef}
        className="join-dialog"
        aria-labelledby="join-title"
        onClose={close}
        onClick={(e) => {
          // Clicks on the backdrop land on the <dialog> element itself
          if (e.target === e.currentTarget) close();
        }}
      >
        <div className="join-dialog__panel section--ink">
          <div className="join-dialog__top">
            <p className="eyebrow">The CX Assembly</p>
            <button type="button" className="dialog__close" onClick={close} style={{ margin: 0, color: 'var(--on-ink)' }}>
              Close <span aria-hidden="true">✕</span>
            </button>
          </div>

          <h2 id="join-title" className="h-lg" style={{ marginTop: 'clamp(32px, 6vh, 64px)' }}>
            Community Application Form
          </h2>
          <p className="lede" style={{ marginTop: 16 }}>
            Only for brand side CX Heads.
          </p>

          <div style={{ marginTop: 'clamp(32px, 6vh, 56px)' }}>{open && <JoinForm source={source} />}</div>
        </div>
      </dialog>
    </JoinModalContext.Provider>
  );
}

export function JoinButton({
  children,
  source,
  className = 'cta cta--solid',
  onClick,
}: {
  children: React.ReactNode;
  /** Which CTA this is, e.g. "hero" or "navbar"; stored with the lead. */
  source: string;
  className?: string;
  onClick?: () => void;
}) {
  const { openJoin } = useContext(JoinModalContext);
  return (
    <button
      type="button"
      className={className}
      aria-haspopup="dialog"
      data-cta={source}
      onClick={() => {
        onClick?.();
        openJoin(source);
      }}
    >
      {children}
    </button>
  );
}
