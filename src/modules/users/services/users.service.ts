import 'server-only';
import { cache } from 'react';
import { getAdminAuth, getAdminDb } from '@/config/firebase-admin';
import { ALL_SECTIONS } from '@/modules/auth/models/access.model';
import { AdminUser } from '../models/user.model';

/**
 * Super admins defined in code. They always have full access (including user
 * management) and can't be edited or removed from the admin UI, so the console
 * can never be locked out.
 */
export const BUILT_IN_SUPERADMINS: { email: string; name: string }[] = [
  { email: 'vishakhasingh201998@gmail.com', name: 'Vishakha Singh' },
  { email: 'viveksheth92@gmail.com', name: 'Vivek Sheth' },
  { email: 'abhishekroks12345@gmail.com', name: 'Abhishek Rawat' },
];

export const USERS_COLLECTION = 'adminUsers';

export const normalizeEmail = (email: string) => email.trim().toLowerCase();

export function isBuiltInSuperadmin(email: string) {
  const e = normalizeEmail(email);
  return BUILT_IN_SUPERADMINS.some((u) => u.email === e);
}

type StoredUser = Omit<AdminUser, 'email' | 'builtIn'>;

function builtInUser(email: string, stored?: Partial<StoredUser>): AdminUser {
  const base = BUILT_IN_SUPERADMINS.find((u) => u.email === email)!;
  return {
    email,
    name: stored?.name || base.name,
    role: 'superadmin',
    sections: ALL_SECTIONS,
    active: true,
    builtIn: true,
    lastLoginAt: stored?.lastLoginAt,
  };
}

/** The admin record for an email, or null if they have no access. Cached per request. */
export const getAdminUser = cache(async (rawEmail: string): Promise<AdminUser | null> => {
  const email = normalizeEmail(rawEmail);
  const db = getAdminDb();

  let stored: Partial<StoredUser> | undefined;
  if (db) {
    try {
      const doc = await db.collection(USERS_COLLECTION).doc(email).get();
      if (doc.exists) stored = doc.data() as StoredUser;
    } catch (e) {
      console.warn('Could not load admin user:', e);
    }
  }

  if (isBuiltInSuperadmin(email)) return builtInUser(email, stored);
  if (!stored) return null;

  return {
    email,
    name: stored.name || email.split('@')[0],
    role: stored.role === 'superadmin' ? 'superadmin' : 'admin',
    sections: (stored.sections ?? []).filter((s) => ALL_SECTIONS.includes(s)),
    active: stored.active !== false,
    createdAt: stored.createdAt,
    createdBy: stored.createdBy,
    updatedAt: stored.updatedAt,
    lastLoginAt: stored.lastLoginAt,
  };
});

export async function listAdminUsers(): Promise<AdminUser[]> {
  const db = getAdminDb();
  const stored = new Map<string, StoredUser>();

  if (db) {
    try {
      const snap = await db.collection(USERS_COLLECTION).get();
      snap.forEach((doc) => stored.set(doc.id, doc.data() as StoredUser));
    } catch (e) {
      console.warn('Could not list admin users:', e);
    }
  }

  const builtIns = BUILT_IN_SUPERADMINS.map((u) => builtInUser(u.email, stored.get(u.email)));
  const others = [...stored.entries()]
    .filter(([email]) => !isBuiltInSuperadmin(email))
    .map(([email, data]) => ({
      ...data,
      email,
      role: data.role === 'superadmin' ? ('superadmin' as const) : ('admin' as const),
      sections: (data.sections ?? []).filter((s) => ALL_SECTIONS.includes(s)),
      active: data.active !== false,
    }))
    .sort((a, b) => (b.createdAt ?? '').localeCompare(a.createdAt ?? ''));

  return [...builtIns, ...others];
}

export async function recordLogin(email: string) {
  const db = getAdminDb();
  if (!db) return;
  try {
    await db
      .collection(USERS_COLLECTION)
      .doc(normalizeEmail(email))
      .set({ lastLoginAt: new Date().toISOString() }, { merge: true });
  } catch (e) {
    console.warn('Could not record login:', e);
  }
}

/**
 * Makes sure a Firebase Auth account exists for an invited email so they can
 * set a password via the reset-link flow. Google sign-in needs no account up front.
 */
export async function ensureAuthAccount(email: string, name?: string) {
  const auth = getAdminAuth();
  if (!auth) return;
  try {
    await auth.getUserByEmail(email);
  } catch (e) {
    if ((e as { code?: string }).code !== 'auth/user-not-found') throw e;
    // emailVerified: a super admin vouched for this address, so the password route is trusted.
    await auth.createUser({ email, emailVerified: true, displayName: name || undefined });
  }
}
