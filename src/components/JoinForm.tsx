'use client';

import { useActionState } from 'react';
import { submitLead, SubmitLeadState } from '@/app/actions/leads';

const initialState: SubmitLeadState = {};

export default function JoinForm({ defaultType = 'cx_leader' }: { defaultType?: 'cx_leader' | 'partner' | 'other' }) {
  const [state, formAction, isPending] = useActionState(submitLead, initialState);

  return (
    <div
      style={{
        background: '#FFFFFF',
        borderRadius: 'var(--radius-lg)',
        padding: '40px',
        boxShadow: 'var(--shadow-xl)',
        border: '1px solid var(--color-card-border)',
        width: '100%',
        maxWidth: '680px',
        margin: '0 auto',
      }}
    >
      <div style={{ marginBottom: '28px', textAlign: 'center' }}>
        <span className="badge-pill badge-navy" style={{ marginBottom: '12px' }}>
          Membership & Inquiries
        </span>
        <h3 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--color-primary)', marginBottom: '8px' }}>
          Connect With The Assembly
        </h3>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9375rem' }}>
          Curated membership for brand-side CX leaders and strategic ecosystem partners.
        </p>
      </div>

      {state.success ? (
        <div
          style={{
            background: 'rgba(34, 197, 94, 0.08)',
            border: '1px solid rgba(34, 197, 94, 0.3)',
            borderRadius: 'var(--radius-md)',
            padding: '28px',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              background: '#22C55E',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
            }}
          >
            <svg width="28" height="28" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          </div>
          <h4 style={{ color: '#15803D', fontSize: '1.25rem', fontWeight: 700, marginBottom: '8px' }}>
            Application Received!
          </h4>
          <p style={{ color: '#166534', fontSize: '0.9375rem', lineHeight: 1.6 }}>
            {state.message}
          </p>
        </div>
      ) : (
        <form action={formAction} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Honeypot hidden input */}
          <div style={{ display: 'none' }}>
            <label htmlFor="hp_field">Do not fill this</label>
            <input type="text" id="hp_field" name="hp_field" tabIndex={-1} autoComplete="off" />
          </div>

          {/* Type Selector */}
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-primary)', marginBottom: '8px' }}>
              I am interested as:
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '10px 8px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1.5px solid #CBD5E1',
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  textAlign: 'center',
                  background: '#F8FAFC',
                }}
                className="type-radio"
              >
                <input
                  type="radio"
                  name="type"
                  value="cx_leader"
                  defaultChecked={defaultType === 'cx_leader'}
                  style={{ marginRight: '6px' }}
                />
                CX Leader
              </label>

              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '10px 8px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1.5px solid #CBD5E1',
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  textAlign: 'center',
                  background: '#F8FAFC',
                }}
                className="type-radio"
              >
                <input
                  type="radio"
                  name="type"
                  value="partner"
                  defaultChecked={defaultType === 'partner'}
                  style={{ marginRight: '6px' }}
                />
                Partner
              </label>

              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '10px 8px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1.5px solid #CBD5E1',
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  textAlign: 'center',
                  background: '#F8FAFC',
                }}
                className="type-radio"
              >
                <input
                  type="radio"
                  name="type"
                  value="other"
                  defaultChecked={defaultType === 'other'}
                  style={{ marginRight: '6px' }}
                />
                General
              </label>
            </div>
          </div>

          {/* Name & Email Row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
            <div>
              <label htmlFor="fullName" style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-primary)', marginBottom: '6px' }}>
                Full Name <span style={{ color: '#EF4444' }}>*</span>
              </label>
              <input
                id="fullName"
                name="fullName"
                type="text"
                required
                placeholder="e.g. Anand Sharma"
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  borderRadius: 'var(--radius-sm)',
                  border: state.errors?.fullName ? '1.5px solid #EF4444' : '1px solid #CBD5E1',
                  fontSize: '0.9375rem',
                  outline: 'none',
                }}
              />
              {state.errors?.fullName && (
                <p style={{ color: '#EF4444', fontSize: '0.75rem', marginTop: '4px' }}>{state.errors.fullName[0]}</p>
              )}
            </div>

            <div>
              <label htmlFor="email" style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-primary)', marginBottom: '6px' }}>
                Email Address <span style={{ color: '#EF4444' }}>*</span>
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                placeholder="name@company.com"
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  borderRadius: 'var(--radius-sm)',
                  border: state.errors?.email ? '1.5px solid #EF4444' : '1px solid #CBD5E1',
                  fontSize: '0.9375rem',
                  outline: 'none',
                }}
              />
              {state.errors?.email && (
                <p style={{ color: '#EF4444', fontSize: '0.75rem', marginTop: '4px' }}>{state.errors.email[0]}</p>
              )}
            </div>
          </div>

          {/* Designation & Company Row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
            <div>
              <label htmlFor="designation" style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-primary)', marginBottom: '6px' }}>
                Designation / Title <span style={{ color: '#EF4444' }}>*</span>
              </label>
              <input
                id="designation"
                name="designation"
                type="text"
                required
                placeholder="e.g. Head of CX, VP Customer Delight"
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  borderRadius: 'var(--radius-sm)',
                  border: state.errors?.designation ? '1.5px solid #EF4444' : '1px solid #CBD5E1',
                  fontSize: '0.9375rem',
                  outline: 'none',
                }}
              />
              {state.errors?.designation && (
                <p style={{ color: '#EF4444', fontSize: '0.75rem', marginTop: '4px' }}>{state.errors.designation[0]}</p>
              )}
            </div>

            <div>
              <label htmlFor="company" style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-primary)', marginBottom: '6px' }}>
                Company Name <span style={{ color: '#EF4444' }}>*</span>
              </label>
              <input
                id="company"
                name="company"
                type="text"
                required
                placeholder="e.g. Tata Consumer, Nykaa"
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  borderRadius: 'var(--radius-sm)',
                  border: state.errors?.company ? '1.5px solid #EF4444' : '1px solid #CBD5E1',
                  fontSize: '0.9375rem',
                  outline: 'none',
                }}
              />
              {state.errors?.company && (
                <p style={{ color: '#EF4444', fontSize: '0.75rem', marginTop: '4px' }}>{state.errors.company[0]}</p>
              )}
            </div>
          </div>

          {/* LinkedIn Profile & Phone Row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
            <div>
              <label htmlFor="linkedinUrl" style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-primary)', marginBottom: '6px' }}>
                LinkedIn Profile URL <span style={{ color: 'var(--color-text-muted)', fontWeight: 400 }}>(recommended)</span>
              </label>
              <input
                id="linkedinUrl"
                name="linkedinUrl"
                type="url"
                placeholder="https://linkedin.com/in/username"
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid #CBD5E1',
                  fontSize: '0.9375rem',
                  outline: 'none',
                }}
              />
            </div>

            <div>
              <label htmlFor="phone" style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-primary)', marginBottom: '6px' }}>
                Phone Number <span style={{ color: 'var(--color-text-muted)', fontWeight: 400 }}>(optional)</span>
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                placeholder="+91 98765 43210"
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid #CBD5E1',
                  fontSize: '0.9375rem',
                  outline: 'none',
                }}
              />
            </div>
          </div>

          {/* Message / Areas of Interest */}
          <div>
            <label htmlFor="message" style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-primary)', marginBottom: '6px' }}>
              Key Priorities or Message <span style={{ color: 'var(--color-text-muted)', fontWeight: 400 }}>(optional)</span>
            </label>
            <textarea
              id="message"
              name="message"
              rows={3}
              placeholder="What are the biggest CX challenges or discussions you'd like to participate in?"
              style={{
                width: '100%',
                padding: '12px 14px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid #CBD5E1',
                fontSize: '0.9375rem',
                outline: 'none',
                resize: 'vertical',
              }}
            />
          </div>

          {state.message && !state.success && (
            <div style={{ padding: '12px', background: '#FEE2E2', color: '#B91C1C', borderRadius: 'var(--radius-sm)', fontSize: '0.875rem' }}>
              {state.message}
            </div>
          )}

          <button
            type="submit"
            disabled={isPending}
            className="btn btn-primary"
            style={{ width: '100%', padding: '14px', fontSize: '1rem', marginTop: '6px' }}
          >
            {isPending ? 'Submitting Application...' : 'Submit Application'}
          </button>

          <p style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
            Your information is kept strictly confidential. Only curated brand leaders and eligible partners are admitted.
          </p>
        </form>
      )}
    </div>
  );
}
