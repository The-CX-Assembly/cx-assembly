import 'server-only';
import { createHmac, timingSafeEqual } from 'node:crypto';
import { cache } from 'react';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getAdminUser, normalizeEmail } from '@/modules/users/services/users.service';
import { AdminSection, canAccess, homePathFor } from '@/modules/auth/models/access.model';
import { AdminUser } from '@/modules/users/models/user.model';

const COOKIE_NAME = 'cx_admin_session';

/** Returned by server actions when the signed-in admin lacks the section. */
export const NO_ACCESS = 'You don’t have access to this section.';
const MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 days

function getSecret(): string | null {
  const secret = process.env.ADMIN_SESSION_SECRET;
  return secret && secret.length >= 32 ? secret : null;
}

const sign = (payload: string, secret: string) => createHmac('sha256', secret).update(payload).digest('base64url');

/** Starts a signed session. Throws if the signing secret isn't configured. */
export async function setAdminSession(email: string) {
  const secret = getSecret();
  if (!secret) throw new Error('ADMIN_SESSION_SECRET is missing or shorter than 32 characters.');

  const now = Math.floor(Date.now() / 1000);
  const payload = Buffer.from(
    JSON.stringify({ email: normalizeEmail(email), iat: now, exp: now + MAX_AGE_SECONDS }),
  ).toString('base64url');

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, `${payload}.${sign(payload, secret)}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: MAX_AGE_SECONDS,
    path: '/',
  });
}

async function readSessionEmail(): Promise<string | null> {
  const secret = getSecret();
  if (!secret) return null;

  const cookieStore = await cookies();
  const value = cookieStore.get(COOKIE_NAME)?.value;
  if (!value) return null;

  const [payload, signature] = value.split('.');
  if (!payload || !signature) return null;

  const expected = Buffer.from(sign(payload, secret));
  const actual = Buffer.from(signature);
  if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) return null;

  try {
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString('utf-8'));
    if (typeof data.email !== 'string' || typeof data.exp !== 'number') return null;
    if (data.exp < Math.floor(Date.now() / 1000)) return null;
    return data.email;
  } catch {
    return null;
  }
}

/**
 * The signed-in admin, or null. Access is re-read on every request, so disabling
 * or removing a user takes effect immediately.
 */
export const getAdminSession = cache(async (): Promise<AdminUser | null> => {
  const email = await readSessionEmail();
  if (!email) return null;
  const user = await getAdminUser(email);
  return user && user.active ? user : null;
});

export async function clearAdminSession() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

/** For pages: sends visitors to sign-in and users without access to their own home page. */
export async function requireSection(section: AdminSection): Promise<AdminUser> {
  const user = await getAdminSession();
  if (!user) redirect('/admin/login');
  if (!canAccess(user, section)) redirect(homePathFor(user));
  return user;
}

export async function requireSuperadmin(): Promise<AdminUser> {
  const user = await getAdminSession();
  if (!user) redirect('/admin/login');
  if (user.role !== 'superadmin') redirect(homePathFor(user));
  return user;
}

/** For server actions: the user if they may act on this section, otherwise null. */
export async function authorize(section: AdminSection | 'users' | 'sites'): Promise<AdminUser | null> {
  const user = await getAdminSession();
  if (!user) return null;
  // Managing people and websites is reserved for super admins.
  if (section === 'users' || section === 'sites') return user.role === 'superadmin' ? user : null;
  return canAccess(user, section) ? user : null;
}
