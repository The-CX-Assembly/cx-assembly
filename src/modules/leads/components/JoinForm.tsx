'use client';

import { useActionState } from 'react';
import { usePathname } from 'next/navigation';
import { readAttribution } from '../utils/attribution';
import { submitLead, SubmitLeadState } from '../controllers/leads.actions';
import { ArrowRight } from '@/components/site/Icons';

const initialState: SubmitLeadState = {};

const FIELDS = [
  { name: 'fullName', label: 'Full name', type: 'text', placeholder: 'Your name', autoComplete: 'name' },
  { name: 'designation', label: 'Designation', type: 'text', placeholder: 'Head of CX', autoComplete: 'organization-title' },
  { name: 'company', label: 'Company', type: 'text', placeholder: 'Company name', autoComplete: 'organization' },
  { name: 'email', label: 'Work email', type: 'email', placeholder: 'name@company.com', autoComplete: 'email' },
] as const;

/** Only mounted once the dialog opens, so it always renders in the browser. */
export default function JoinForm({ source }: { source: string }) {
  const [state, formAction, isPending] = useActionState(submitLead, initialState);
  const pathname = usePathname();
  const visit = readAttribution();

  if (state.success) {
    return (
      <div role="status" aria-live="polite">
        <p className="h-md" style={{ color: 'var(--on-ink)' }}>
          Thank you. <span className="soft">Application received.</span>
        </p>
        <p className="lede" style={{ marginTop: 16 }}>
          {state.message}
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} className="form" noValidate>
      <input type="hidden" name="type" value="cx_leader" />
      <input type="hidden" name="source_cta" value={source} />
      <input type="hidden" name="source_page" value={pathname} />
      <input type="hidden" name="source_referrer" value={visit.referrer ?? ''} />
      <input type="hidden" name="source_landing_page" value={visit.landing_page ?? ''} />
      {(['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'] as const).map((k) => (
        <input key={k} type="hidden" name={k} value={visit[k] ?? ''} />
      ))}

      {/* Honeypot */}
      <div className="sr-only" aria-hidden="true">
        <label htmlFor="hp_field">Do not fill this</label>
        <input type="text" id="hp_field" name="hp_field" tabIndex={-1} autoComplete="off" />
      </div>

      {FIELDS.map((f) => {
        const error = state.errors?.[f.name]?.[0];
        return (
          <div key={f.name} className="field">
            <label htmlFor={f.name} className="field__label">
              {f.label}
            </label>
            <input
              id={f.name}
              name={f.name}
              type={f.type}
              required
              placeholder={f.placeholder}
              autoComplete={f.autoComplete}
              // React resets the form after submitting; this restores what was typed on errors.
              defaultValue={state.values?.[f.name]}
              className="field__input"
              aria-invalid={error ? true : undefined}
              aria-describedby={error ? `${f.name}-error` : undefined}
            />
            {error && (
              <p id={`${f.name}-error`} className="field__error">
                {error}
              </p>
            )}
          </div>
        );
      })}

      {state.message && !state.success && (
        <p className="field__error form__full" role="alert" style={{ marginTop: -16 }}>
          {state.message}
        </p>
      )}

      <div className="form__full" style={{ marginTop: 8 }}>
        <button type="submit" disabled={isPending} className="cta cta--solid">
          {isPending ? 'Submitting…' : 'Submit application'}
          <ArrowRight size={16} />
        </button>
      </div>
    </form>
  );
}
