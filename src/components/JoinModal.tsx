'use client';

import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import JoinForm from '@/components/JoinForm';

const JoinModalContext = createContext<{ openJoin: () => void }>({ openJoin: () => {} });

/**
 * Site-wide membership popup. Any <JoinButton> opens it, and so does a URL
 * ending in #join (kept so older links and bookmarks still work).
 */
export function JoinModalProvider({ children }: { children: React.ReactNode }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState(false);

  const openJoin = useCallback(() => setOpen(true), []);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      dialog.showModal();
      requestAnimationFrame(() => dialog.querySelector<HTMLInputElement>('#fullName')?.focus());
    }
    if (!open && dialog.open) dialog.close();
  }, [open]);

  useEffect(() => {
    const fromHash = () => {
      if (window.location.hash === '#join') {
        setOpen(true);
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
        onClose={() => setOpen(false)}
        onClick={(e) => {
          // Clicks on the backdrop land on the <dialog> element itself
          if (e.target === e.currentTarget) setOpen(false);
        }}
      >
        <div className="join-dialog__panel section--ink">
          <div className="join-dialog__top">
            <p className="eyebrow">The CX Assembly</p>
            <button type="button" className="dialog__close" onClick={() => setOpen(false)} style={{ margin: 0, color: 'var(--on-ink)' }}>
              Close <span aria-hidden="true">✕</span>
            </button>
          </div>

          <h2 id="join-title" className="h-lg" style={{ marginTop: 'clamp(32px, 6vh, 64px)' }}>
            Membership Application Form
          </h2>
          <p className="lede" style={{ marginTop: 16 }}>
            Only for brand side CX Heads.
          </p>

          <div style={{ marginTop: 'clamp(32px, 6vh, 56px)' }}>{open && <JoinForm />}</div>
        </div>
      </dialog>
    </JoinModalContext.Provider>
  );
}

export function JoinButton({
  children,
  className = 'cta cta--solid',
  onClick,
}: {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}) {
  const { openJoin } = useContext(JoinModalContext);
  return (
    <button
      type="button"
      className={className}
      aria-haspopup="dialog"
      onClick={() => {
        onClick?.();
        openJoin();
      }}
    >
      {children}
    </button>
  );
}
