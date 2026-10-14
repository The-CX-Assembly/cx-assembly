'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { loginAdminAction } from '@/app/actions/auth';

const initialState: { error?: string } = {};

export default function AdminLoginPage() {
  const [state, formAction, isPending] = useActionState(loginAdminAction, initialState);

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'var(--color-bg-warm)',
        padding: '24px',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '440px',
          backgroundColor: '#FFFFFF',
          borderRadius: 'var(--radius-xl)',
          padding: '40px 32px',
          boxShadow: 'var(--shadow-xl)',
          border: '1px solid #E2E8F0',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ position: 'relative', width: '64px', height: '64px', margin: '0 auto 16px', borderRadius: '12px', overflow: 'hidden' }}>
            <Image
              src="/brand/logo.png"
              alt="The CX Assembly"
              fill
              sizes="64px"
              style={{ objectFit: 'contain' }}
              priority
            />
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-primary)', marginBottom: '6px' }}>
            The CX Assembly
          </h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
            Administrative Control Portal
          </p>
        </div>

        {state?.error && (
          <div
            style={{
              padding: '12px 16px',
              backgroundColor: '#FEE2E2',
              color: '#B91C1C',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.875rem',
              marginBottom: '20px',
              border: '1px solid #FCA5A5',
            }}
          >
            {state.error}
          </div>
        )}

        <form action={formAction} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div>
            <label htmlFor="email" style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-primary)', marginBottom: '6px' }}>
              Admin Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              defaultValue="abhishekroks12345@gmail.com"
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
            <label htmlFor="password" style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-primary)', marginBottom: '6px' }}>
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              placeholder="••••••••••••"
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

          <button
            type="submit"
            disabled={isPending}
            className="btn btn-primary"
            style={{ width: '100%', padding: '13px', marginTop: '8px' }}
          >
            {isPending ? 'Authenticating...' : 'Sign In to Dashboard'}
          </button>
        </form>

        <div style={{ marginTop: '24px', textAlign: 'center', borderTop: '1px solid #F1F5F9', paddingTop: '16px' }}>
          <Link href="/" style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
            ← Back to Public Website
          </Link>
        </div>
      </div>
    </div>
  );
}
