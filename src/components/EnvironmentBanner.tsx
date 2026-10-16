import { IS_STAGING } from '@/config/env';

/** A small, always-visible marker so nobody mistakes staging for the live site. */
export default function EnvironmentBanner() {
  if (!IS_STAGING) return null;
  return (
    <div
      role="note"
      aria-label="Staging environment"
      style={{
        position: 'fixed',
        left: 12,
        bottom: 12,
        zIndex: 2147483000,
        padding: '6px 12px',
        borderRadius: 999,
        background: '#B45309',
        color: '#FFFFFF',
        font: '600 12px/1.2 system-ui, sans-serif',
        letterSpacing: '0.04em',
        boxShadow: '0 4px 14px rgba(0, 0, 0, 0.25)',
        pointerEvents: 'none',
      }}
    >
      STAGING · not the live site
    </div>
  );
}
