'use client';

import { useActionState, useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import type { Resource } from '../models/media.model';
import { requestResource, type ResourceRequestState } from '../controllers/resource-request.actions';
import { formatBytes } from '../utils/embed';
import { readAttribution } from '@/modules/leads/utils/attribution';
import { ArrowRight } from '@/components/site/Icons';
import styles from './media.module.css';

type PublicResource = Omit<Resource, 'storagePath'>;

const FIELDS = [
  { name: 'fullName', label: 'Full name', type: 'text', autoComplete: 'name', required: true },
  { name: 'email', label: 'Work email', type: 'email', autoComplete: 'email', required: true },
  { name: 'company', label: 'Company', type: 'text', autoComplete: 'organization', required: true },
  { name: 'designation', label: 'Designation (optional)', type: 'text', autoComplete: 'organization-title', required: false },
] as const;

/** The form behind each download: details first, then a short-lived link. */
function GateForm({ resource }: { resource: PublicResource }) {
  const [state, action, pending] = useActionState(requestResource, {} as ResourceRequestState);
  const pathname = usePathname();
  const visit = readAttribution();

  // Start the download as soon as the link arrives.
  useEffect(() => {
    if (state.success && state.downloadUrl) window.location.assign(state.downloadUrl);
  }, [state.success, state.downloadUrl]);

  if (state.success) {
    return (
      <div className={styles.success} role="status">
        <p className="h-md" style={{ color: 'var(--on-ink)' }}>
          Thank you. <span className="soft">Your download is starting.</span>
        </p>
        {state.downloadUrl && (
          <a className="cta cta--light" href={state.downloadUrl} style={{ alignSelf: 'flex-start' }}>
            Download again <ArrowRight size={16} />
          </a>
        )}
        <p className="lede" style={{ fontSize: '0.9375rem' }}>
          The link works for 15 minutes.
        </p>
      </div>
    );
  }

  return (
    <form action={action} className="form" noValidate>
      <input type="hidden" name="resourceId" value={resource.id} />
      <input type="hidden" name="source_page" value={pathname} />
      <input type="hidden" name="source_referrer" value={visit.referrer ?? ''} />
      <input type="hidden" name="source_landing_page" value={visit.landing_page ?? ''} />
      {(['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'] as const).map((k) => (
        <input key={k} type="hidden" name={k} value={visit[k] ?? ''} />
      ))}
      <div className="sr-only" aria-hidden="true">
        <label htmlFor="pdf_hp">Do not fill this</label>
        <input type="text" id="pdf_hp" name="hp_field" tabIndex={-1} autoComplete="off" />
      </div>

      {FIELDS.map((f) => {
        const error = state.errors?.[f.name]?.[0];
        return (
          <div key={f.name} className="field">
            <label htmlFor={`pdf-${f.name}`} className="field__label">
              {f.label}
            </label>
            <input
              id={`pdf-${f.name}`}
              name={f.name}
              type={f.type}
              required={f.required}
              autoComplete={f.autoComplete}
              className="field__input"
              defaultValue={state.values?.[f.name]}
              aria-invalid={error ? true : undefined}
              aria-describedby={error ? `pdf-${f.name}-error` : undefined}
            />
            {error && (
              <p id={`pdf-${f.name}-error`} className="field__error">
                {error}
              </p>
            )}
          </div>
        );
      })}

      {state.message && !state.success && (
        <p className="field__error form__full" role="alert">
          {state.message}
        </p>
      )}

      <div className="form__full" style={{ marginTop: 8 }}>
        <button type="submit" disabled={pending} className="cta cta--light">
          {pending ? 'Preparing…' : 'Get the PDF'}
          <ArrowRight size={16} />
        </button>
      </div>
    </form>
  );
}

export default function ResourceList({ resources }: { resources: PublicResource[] }) {
  const [open, setOpen] = useState<PublicResource | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <>
      <ul className={styles.docs}>
        {resources.map((r) => (
          <li key={r.id} className={styles.doc}>
            <div className={styles.cover} aria-hidden="true">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {r.coverUrl ? <img src={r.coverUrl} alt="" loading="lazy" /> : 'PDF'}
            </div>
            <h3 className={styles.title}>{r.title}</h3>
            {r.description && <p className={styles.description} style={{ marginTop: -4 }}>{r.description}</p>}
            <span className={styles.meta}>PDF · {formatBytes(r.fileSize)}</span>
            <button type="button" className="cta cta--solid" data-cta="pdf-download" onClick={() => setOpen(r)}>
              Download <ArrowRight size={16} />
            </button>
          </li>
        ))}
      </ul>

      <dialog
        ref={dialogRef}
        className="join-dialog"
        aria-labelledby="pdf-title"
        onClose={() => setOpen(null)}
        onClick={(e) => e.target === e.currentTarget && setOpen(null)}
      >
        <div className="join-dialog__panel section--ink">
          <div className="join-dialog__top">
            <p className="eyebrow">Download</p>
            <button type="button" className="dialog__close" onClick={() => setOpen(null)} style={{ margin: 0, color: 'var(--on-ink)' }}>
              Close <span aria-hidden="true">✕</span>
            </button>
          </div>
          {open && (
            <>
              <h2 id="pdf-title" className="h-lg" style={{ marginTop: 'clamp(32px, 6vh, 64px)' }}>
                {open.title}
              </h2>
              <p className="lede" style={{ marginTop: 16 }}>
                Tell us who you are and the PDF downloads straight away.
              </p>
              <div style={{ marginTop: 'clamp(32px, 6vh, 56px)' }}>
                {/* Keyed so each PDF gets a fresh form. */}
                <GateForm key={open.id} resource={open} />
              </div>
            </>
          )}
        </div>
      </dialog>
    </>
  );
}
