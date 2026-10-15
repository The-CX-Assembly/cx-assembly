'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  GoogleAuthProvider,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  type User,
} from 'firebase/auth';
import { auth } from '@/lib/firebase-client';
import { completeSignIn, preparePasswordSetup } from '@/features/auth/actions';
import styles from './AdminLogin.module.css';

type Pending = null | 'google' | 'password' | 'reset';

const FIREBASE_ERRORS: Record<string, string> = {
  'auth/invalid-credential': 'Incorrect email or password.',
  'auth/wrong-password': 'Incorrect email or password.',
  'auth/user-not-found': 'Incorrect email or password.',
  'auth/invalid-email': 'Enter a valid email address.',
  'auth/too-many-requests': 'Too many attempts. Please wait a moment and try again.',
  'auth/user-disabled': 'This account has been disabled.',
  'auth/network-request-failed': 'Network error. Check your connection and try again.',
  'auth/operation-not-allowed': 'This sign-in method isn’t enabled for the project yet.',
  'auth/unauthorized-domain': 'This domain isn’t authorised for sign-in in Firebase yet.',
  'auth/popup-blocked': 'Your browser blocked the sign-in popup. Allow popups and try again.',
};

const SILENT_ERRORS = new Set(['auth/popup-closed-by-user', 'auth/cancelled-popup-request']);

function messageFor(error: unknown) {
  const code = (error as { code?: string })?.code ?? '';
  if (SILENT_ERRORS.has(code)) return '';
  return FIREBASE_ERRORS[code] ?? 'Sign-in failed. Please try again.';
}

export default function LoginForm() {
  const [mode, setMode] = useState<'signin' | 'reset'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [pending, setPending] = useState<Pending>(null);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');

  const busy = pending !== null;

  // The browser-side Firebase session is only used to prove identity once;
  // the server then issues its own admin session cookie.
  async function finish(user: User) {
    const token = await user.getIdToken();
    const result = await completeSignIn(token);
    await signOut(auth).catch(() => {});
    if (result.error) {
      setError(result.error);
      setPending(null);
      return;
    }
    window.location.assign(result.redirectTo ?? '/admin');
  }

  async function run(kind: Exclude<Pending, null>, task: () => Promise<void>) {
    setError('');
    setInfo('');
    setPending(kind);
    try {
      await task();
    } catch (e) {
      setError(messageFor(e));
      setPending(null);
    }
  }

  const onGoogle = () =>
    run('google', async () => {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      const { user } = await signInWithPopup(auth, provider);
      await finish(user);
    });

  const onPassword = (e: React.FormEvent) => {
    e.preventDefault();
    run('password', async () => {
      const { user } = await signInWithEmailAndPassword(auth, email.trim(), password);
      await finish(user);
    });
  };

  const onReset = (e: React.FormEvent) => {
    e.preventDefault();
    run('reset', async () => {
      const address = email.trim();
      await preparePasswordSetup(address);
      try {
        await sendPasswordResetEmail(auth, address);
      } catch (err) {
        // Don't reveal whether the address has an account.
        if ((err as { code?: string }).code !== 'auth/user-not-found') throw err;
      }
      setInfo(`If ${address} has admin access, a link to set your password is on its way. Check your inbox.`);
      setPending(null);
    });
  };

  const switchMode = (next: 'signin' | 'reset') => {
    setMode(next);
    setError('');
    setInfo('');
  };

  return (
    <div className={styles.page}>
      <span className={`${styles.blob} ${styles.blobA}`} aria-hidden="true" />
      <span className={`${styles.blob} ${styles.blobB}`} aria-hidden="true" />
      <span className={`${styles.blob} ${styles.blobC}`} aria-hidden="true" />

      <main className={styles.card}>
        <div className={styles.brand}>
          <span className={styles.logo}>
            <Image src="/brand/logo.png" alt="The CX Assembly" fill sizes="56px" style={{ objectFit: 'contain' }} priority />
          </span>
          <span className={styles.badge}>Admin Console</span>
        </div>

        <div key={mode} className={styles.panel}>
          <h1 className={styles.title}>{mode === 'signin' ? 'Welcome back' : 'Set or reset your password'}</h1>
          <p className={styles.subtitle}>
            {mode === 'signin'
              ? 'Sign in to manage The CX Assembly.'
              : 'We’ll email you a secure link to choose a new password.'}
          </p>

          {error && (
            <p className={`${styles.alert} ${styles.alertError}`} role="alert">
              {error}
            </p>
          )}
          {info && (
            <p className={`${styles.alert} ${styles.alertInfo}`} role="status">
              {info}
            </p>
          )}

          {mode === 'signin' ? (
            <>
              <button type="button" className={styles.google} onClick={onGoogle} disabled={busy}>
                {pending === 'google' ? (
                  <span className={styles.spinner} aria-hidden="true" />
                ) : (
                  <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
                    <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
                    <path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
                    <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.3 0-9.7-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z" />
                    <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" />
                  </svg>
                )}
                Continue with Google
              </button>

              <div className={styles.divider}>
                <span>or sign in with email</span>
              </div>

              <form onSubmit={onPassword} className={styles.form}>
                <label className={styles.field}>
                  <span>Email</span>
                  <input
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@company.com"
                  />
                </label>
                <label className={styles.field}>
                  <span className={styles.fieldRow}>
                    Password
                    <button type="button" className={styles.linkButton} onClick={() => switchMode('reset')}>
                      Forgot or first time?
                    </button>
                  </span>
                  <input
                    type="password"
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                  />
                </label>
                <button type="submit" className={styles.primary} disabled={busy}>
                  {pending === 'password' && <span className={styles.spinner} aria-hidden="true" />}
                  {pending === 'password' ? 'Signing in…' : 'Sign in'}
                </button>
              </form>
            </>
          ) : (
            <form onSubmit={onReset} className={styles.form}>
              <label className={styles.field}>
                <span>Email</span>
                <input
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                />
              </label>
              <button type="submit" className={styles.primary} disabled={busy}>
                {pending === 'reset' && <span className={styles.spinner} aria-hidden="true" />}
                {pending === 'reset' ? 'Sending…' : 'Email me a link'}
              </button>
              <button type="button" className={styles.linkButton} onClick={() => switchMode('signin')}>
                ← Back to sign in
              </button>
            </form>
          )}
        </div>

        <p className={styles.footnote}>
          Access is by invitation only. <Link href="/">Back to the public website</Link>
        </p>
      </main>
    </div>
  );
}
