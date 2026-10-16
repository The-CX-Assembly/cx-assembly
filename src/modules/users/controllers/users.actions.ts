'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { authorize } from '@/middlewares/auth.middleware';
import { getAdminDb } from '@/config/firebase-admin';
import { ALL_SECTIONS } from '@/modules/auth/models/access.model';
import {
  USERS_COLLECTION,
  ensureAuthAccount,
  isBuiltInSuperadmin,
  normalizeEmail,
} from '../services/users.service';

type Result = { success: true } | { success: false; error: string };

const accessSchema = z
  .object({
    name: z.string().trim().min(2, 'Name must be at least 2 characters').max(80),
    role: z.enum(['superadmin', 'admin']),
    sections: z.array(z.enum(ALL_SECTIONS as [string, ...string[]])),
  })
  .refine((v) => v.role === 'superadmin' || v.sections.length > 0, {
    message: 'Give access to at least one section',
    path: ['sections'],
  });

const createSchema = accessSchema.and(
  z.object({ email: z.string().trim().toLowerCase().email('Enter a valid email address') }),
);

const firstIssue = (e: z.ZodError) => e.issues[0]?.message ?? 'Invalid input';

export async function createAdminUser(input: unknown): Promise<Result> {
  const actor = await authorize('users');
  if (!actor) return { success: false, error: 'Only super admins can add users.' };

  const parsed = createSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: firstIssue(parsed.error) };
  const { email, name, role, sections } = parsed.data;

  if (isBuiltInSuperadmin(email)) return { success: false, error: 'That person is already a built-in super admin.' };

  const db = getAdminDb();
  if (!db) return { success: false, error: 'Database not connected' };

  try {
    const ref = db.collection(USERS_COLLECTION).doc(email);
    if ((await ref.get()).exists) return { success: false, error: 'A user with this email already exists.' };

    const now = new Date().toISOString();
    await ref.set({
      name,
      role,
      sections: role === 'superadmin' ? ALL_SECTIONS : sections,
      active: true,
      createdAt: now,
      updatedAt: now,
      createdBy: actor.email,
    });
  } catch (error) {
    console.error('Error creating admin user:', error);
    return { success: false, error: 'Failed to create user' };
  }

  // Lets them set a password; Google sign-in works without it.
  try {
    await ensureAuthAccount(email, name);
  } catch (error) {
    console.warn('Could not create Firebase Auth account for invite:', error);
  }

  revalidatePath('/admin/users');
  return { success: true };
}

export async function updateAdminUser(rawEmail: string, input: unknown): Promise<Result> {
  const actor = await authorize('users');
  if (!actor) return { success: false, error: 'Only super admins can change access.' };

  const email = normalizeEmail(rawEmail);
  if (isBuiltInSuperadmin(email)) return { success: false, error: 'Built-in super admins can’t be changed.' };

  const parsed = accessSchema.and(z.object({ active: z.boolean() })).safeParse(input);
  if (!parsed.success) return { success: false, error: firstIssue(parsed.error) };
  const { name, role, sections, active } = parsed.data;

  if (email === actor.email && (role !== 'superadmin' || !active)) {
    return { success: false, error: 'You can’t remove your own super admin access.' };
  }

  const db = getAdminDb();
  if (!db) return { success: false, error: 'Database not connected' };

  try {
    const ref = db.collection(USERS_COLLECTION).doc(email);
    if (!(await ref.get()).exists) return { success: false, error: 'User not found.' };
    await ref.set(
      {
        name,
        role,
        sections: role === 'superadmin' ? ALL_SECTIONS : sections,
        active,
        updatedAt: new Date().toISOString(),
        updatedBy: actor.email,
      },
      { merge: true },
    );
  } catch (error) {
    console.error('Error updating admin user:', error);
    return { success: false, error: 'Failed to update user' };
  }

  revalidatePath('/admin/users');
  return { success: true };
}

export async function deleteAdminUser(rawEmail: string): Promise<Result> {
  const actor = await authorize('users');
  if (!actor) return { success: false, error: 'Only super admins can remove users.' };

  const email = normalizeEmail(rawEmail);
  if (isBuiltInSuperadmin(email)) return { success: false, error: 'Built-in super admins can’t be removed.' };
  if (email === actor.email) return { success: false, error: 'You can’t remove yourself.' };

  const db = getAdminDb();
  if (!db) return { success: false, error: 'Database not connected' };

  try {
    await db.collection(USERS_COLLECTION).doc(email).delete();
  } catch (error) {
    console.error('Error deleting admin user:', error);
    return { success: false, error: 'Failed to remove user' };
  }

  revalidatePath('/admin/users');
  return { success: true };
}
