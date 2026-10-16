'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { selectAdminSite } from '../controllers/sites.actions';
import { IconChevronRight, IconGlobe } from '@/components/admin/AdminIcons';
import { Avatar, EmptyState, PageHeader, ui, useToast } from '@/components/admin/ui';

/**
 * Shown on pages that edit one website (content, settings, speakers…) while the
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
  const [toast, showToast] = useToast();

  const choose = async (id: string) => {
    setPending(id);
    const res = await selectAdminSite(id);
    if (!res.success) showToast(res.error, 'error');
    router.refresh();
    setPending(null);
  };

  return (
    <div className={ui.page}>
      <PageHeader eyebrow="Websites" icon={<IconGlobe size={14} />} title={title} description={message} />
      <section className={ui.panel} style={{ maxWidth: 640 }}>
        {sites.length === 0 ? (
          <EmptyState icon={<IconGlobe size={22} />} title="No website has this turned on">
            A super admin can enable it under Websites.
          </EmptyState>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', padding: 8 }}>
            {sites.map((s) => (
              <button
                key={s.id}
                type="button"
                className={ui.sideItem}
                style={{ padding: '12px 14px' }}
                disabled={pending !== null}
                onClick={() => choose(s.id)}
              >
                <span className={ui.person}>
                  <Avatar name={s.name.replace(/^the\s+/i, '')} />
                  <span className={ui.cellMain}>{s.name}</span>
                </span>
                {pending === s.id ? <span className={ui.count}>Opening…</span> : <IconChevronRight size={18} />}
              </button>
            ))}
          </div>
        )}
      </section>
      {toast}
    </div>
  );
}
