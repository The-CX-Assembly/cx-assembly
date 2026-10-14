'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { selectAdminSite } from '@/app/actions/sites';

/**
 * Shown on pages that edit one website (content, settings, leaders…) while the
 * dashboard is set to "All websites", or when the chosen site lacks a feature.
 */
export default function ChooseSite({
  title,
  message,
  sites,
}: {
  title: string;
  message: string;
  sites: { id: string; name: string }[];
}) {
  const router = useRouter();
  const [pending, setPending] = useState<string | null>(null);

  const choose = async (id: string) => {
    setPending(id);
    const res = await selectAdminSite(id);
    if (!res.success) alert(res.error);
    router.refresh();
    setPending(null);
  };

  return (
    <div className="container" style={{ paddingTop: '40px', paddingBottom: '60px' }}>
      <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 'var(--radius-lg)', padding: '36px 32px', maxWidth: 640 }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-primary)', marginBottom: 8 }}>{title}</h1>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9375rem', marginBottom: 24 }}>{message}</p>
        {sites.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            {sites.map((s) => (
              <button
                key={s.id}
                type="button"
                className="btn btn-primary"
                style={{ padding: '10px 18px', fontSize: '0.875rem' }}
                disabled={pending !== null}
                onClick={() => choose(s.id)}
              >
                {pending === s.id ? 'Opening…' : s.name}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
