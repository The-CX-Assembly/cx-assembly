'use server';

import { z } from 'zod';
import { setAdminSession, clearAdminSession } from './session';
import { ensureAuthAccount, getAdminUser, recordLogin } from '@/features/users/server';
import { homePathFor } from './sections';
import { getAdminAuth, hasAdminCredentials } from '@/server/firebase-admin';
import { redirect } from 'next/navigation';

/**
 * Exchanges a Firebase ID token (from Google or email/password sign-in in the
 * browser) for an admin session, if that email has been granted access.
 */
export async function completeSignIn(idToken: string): Promise<{ error?: string; redirectTo?: string }> {
  const auth = getAdminAuth();
  if (!auth) return { error: 'Sign-in is unavailable right now. Please try again shortly.' };

  let email: string | undefined;
  try {
    const decoded = await auth.verifyIdToken(idToken);
    if (!decoded.email_verified) {
      return { error: 'This email address has not been verified.' };
    }
    email = decoded.email;
  } catch (e) {
    console.warn('ID token verification failed:', e);
    return { error: 'We could not verify your sign-in. Please try again.' };
  }

  if (!email) return { error: 'Your account has no email address.' };

  const user = await getAdminUser(email);
  if (!user || !user.active) {
    return { error: `${email} doesn't have access to the admin console. Ask a super admin to invite you.` };
  }

  try {
    await setAdminSession(user.email);
  } catch (e) {
    console.error('Could not start admin session:', e);
    return { error: 'The server is missing its session secret (ADMIN_SESSION_SECRET).' };
  }

  await recordLogin(user.email);
  return { redirectTo: homePathFor(user) };
}

const emailSchema = z.string().trim().toLowerCase().email();

/**
 * Before the browser asks Firebase to email a password link, make sure an
 * account exists for invited users. Always succeeds so it can't be used to
 * probe which emails have access.
 */
export async function preparePasswordSetup(rawEmail: string): Promise<{ ok: true }> {
  const parsed = emailSchema.safeParse(rawEmail);
  if (!parsed.success || !hasAdminCredentials()) return { ok: true };

  const user = await getAdminUser(parsed.data);
  if (user?.active) {
    try {
      await ensureAuthAccount(user.email, user.name);
    } catch (e) {
      console.warn('Could not prepare password setup:', e);
    }
  }
  return { ok: true };
}

export async function logoutAdminAction() {
  await clearAdminSession();
  redirect('/admin/login');
}
