'use server';

import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { z } from 'zod';
import { authorize, getAdminSession } from '@/middlewares/auth.middleware';
import { getAdminDb } from '@/config/firebase-admin';
import { SITE_COOKIE } from '../services/admin-site.service';
import { SITES_COLLECTION, generateApiKey, getSite, listSites } from '../services/sites.service';
import { ALL_SITES, DEFAULT_SITE_ID, SITE_ID_PATTERN } from '../models/site.constants';

type Result = { success: true } | { success: false; error: string };

const firstIssue = (e: z.ZodError) => e.issues[0]?.message ?? 'Invalid input';

/** Switches the website the dashboard is managing. */
export async function selectAdminSite(siteId: string): Promise<Result> {
  if (!(await getAdminSession())) return { success: false, error: 'Please sign in again.' };
  if (siteId !== ALL_SITES && !(await getSite(siteId))) return { success: false, error: 'Unknown website.' };

  const cookieStore = await cookies();
  cookieStore.set(SITE_COOKIE, siteId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 365,
    path: '/admin',
  });
  revalidatePath('/admin', 'layout');
  return { success: true };
}

const origin = z
  .string()
  .trim()
  .transform((v) => v.replace(/\/+$/, ''))
  .pipe(z.string().regex(/^https?:\/\/[^/\s]+$/, 'Origins look like https://example.com (no path)'));

const detailsSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(80),
  url: z.string().trim().url('Enter the full website URL, e.g. https://example.com').max(200).or(z.literal('')),
  allowedOrigins: z.array(origin).max(20, 'At most 20 origins'),
  modules: z.array(z.enum(['leaders'])),
});

const createSchema = detailsSchema.extend({
  id: z.string().trim().toLowerCase().regex(SITE_ID_PATTERN, 'Use lowercase letters, numbers and dashes (max 40)'),
});

export async function createSite(input: unknown): Promise<Result> {
  const actor = await authorize('sites');
  if (!actor) return { success: false, error: 'Only super admins can add websites.' };

  const parsed = createSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: firstIssue(parsed.error) };
  const { id, ...details } = parsed.data;
  if (id === ALL_SITES) return { success: false, error: 'That id is reserved.' };

  const db = getAdminDb();
  if (!db) return { success: false, error: 'Database not connected' };

  try {
    const ref = db.collection(SITES_COLLECTION).doc(id);
    if (id === DEFAULT_SITE_ID || (await ref.get()).exists) {
      return { success: false, error: 'A website with this id already exists.' };
    }
    const now = new Date().toISOString();
    await ref.set({ ...details, createdAt: now, updatedAt: now, createdBy: actor.email });
  } catch (error) {
    console.error('Error creating site:', error);
    return { success: false, error: 'Failed to add website' };
  }

  revalidatePath('/admin', 'layout');
  return { success: true };
}

export async function updateSite(siteId: string, input: unknown): Promise<Result> {
  const actor = await authorize('sites');
  if (!actor) return { success: false, error: 'Only super admins can change websites.' };

  const parsed = detailsSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: firstIssue(parsed.error) };
  if (!(await getSite(siteId))) return { success: false, error: 'Website not found.' };

  const db = getAdminDb();
  if (!db) return { success: false, error: 'Database not connected' };

  // The original site's name and features are defined in code.
  const { name, modules, ...rest } = parsed.data;
  const data = siteId === DEFAULT_SITE_ID ? rest : { name, modules, ...rest };

  try {
    await db
      .collection(SITES_COLLECTION)
      .doc(siteId)
      .set({ ...data, updatedAt: new Date().toISOString(), updatedBy: actor.email }, { merge: true });
  } catch (error) {
    console.error('Error updating site:', error);
    return { success: false, error: 'Failed to save website' };
  }

  revalidatePath('/admin', 'layout');
  return { success: true };
}

/** Issues a new API key, replacing any previous one. The key is returned once and never stored. */
export async function rotateSiteKey(siteId: string): Promise<{ success: true; key: string } | { success: false; error: string }> {
  const actor = await authorize('sites');
  if (!actor) return { success: false, error: 'Only super admins can manage API keys.' };
  if (!(await getSite(siteId))) return { success: false, error: 'Website not found.' };

  const db = getAdminDb();
  if (!db) return { success: false, error: 'Database not connected' };

  const { key, hash, prefix } = generateApiKey();
  try {
    await db
      .collection(SITES_COLLECTION)
      .doc(siteId)
      .set(
        { apiKeyHash: hash, apiKeyPrefix: prefix, keyRotatedAt: new Date().toISOString(), keyRotatedBy: actor.email },
        { merge: true },
      );
  } catch (error) {
    console.error('Error rotating site key:', error);
    return { success: false, error: 'Failed to create API key' };
  }

  revalidatePath('/admin/sites');
  return { success: true, key };
}

/** Removes a website and all of its content. Its leads stay in the inbox. */
export async function deleteSite(siteId: string): Promise<Result> {
  const actor = await authorize('sites');
  if (!actor) return { success: false, error: 'Only super admins can remove websites.' };
  if (siteId === DEFAULT_SITE_ID) return { success: false, error: 'The original website can’t be removed.' };
  if (!(await listSites()).some((s) => s.id === siteId)) return { success: false, error: 'Website not found.' };

  const db = getAdminDb();
  if (!db) return { success: false, error: 'Database not connected' };

  try {
    await db.recursiveDelete(db.collection(SITES_COLLECTION).doc(siteId));
  } catch (error) {
    console.error('Error deleting site:', error);
    return { success: false, error: 'Failed to remove website' };
  }

  revalidatePath('/admin', 'layout');
  return { success: true };
}
