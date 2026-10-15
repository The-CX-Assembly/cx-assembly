'use server';

import { revalidatePath } from 'next/cache';
import { getAdminDb } from '@/server/firebase-admin';
import { revalidateSite } from '@/server/revalidate';
import { NO_ACCESS, authorize } from '@/features/auth/session';
import { siteCollection, siteExists } from '@/features/sites/server';
import { DEFAULT_SITE_ID } from '@/features/sites/constants';
import { SiteSettings, ContentFieldValue } from '@/types';

/** Saves one section of the original website's typed page copy. */
export async function updateSectionContent(
  sectionKey: string,
  data: Record<string, unknown>
) {
  if (!(await authorize('content'))) return { success: false, error: NO_ACCESS };
  const db = getAdminDb();
  if (!db) return { success: false, error: 'Database not connected' };

  try {
    await siteCollection(db, DEFAULT_SITE_ID, 'siteContent').doc(sectionKey).set(data, { merge: true });
    revalidateSite(DEFAULT_SITE_ID, '/admin/content', ['/', '/founding-50', '/community-voices', '/privacy-policy']);
    return { success: true };
  } catch (error) {
    console.error('Error updating section content:', error);
    return { success: false, error: 'Failed to update content' };
  }
}

const KEY_PATTERN = /^[A-Za-z][A-Za-z0-9_-]{0,59}$/;

function isFieldValue(v: unknown): v is ContentFieldValue {
  return typeof v === 'string' || (Array.isArray(v) && v.every((x) => typeof x === 'string'));
}

/** Replaces one free-form content section of any other website. */
export async function saveContentSection(
  siteId: string,
  sectionKey: string,
  fields: Record<string, unknown>,
) {
  if (!(await authorize('content'))) return { success: false, error: NO_ACCESS };
  if (siteId === DEFAULT_SITE_ID) return { success: false, error: 'Use the page editor for this website.' };
  if (!(await siteExists(siteId))) return { success: false, error: 'Website not found.' };
  if (!KEY_PATTERN.test(sectionKey)) {
    return { success: false, error: 'Section keys start with a letter and use letters, numbers, - or _.' };
  }
  const entries = Object.entries(fields ?? {});
  if (entries.length > 100) return { success: false, error: 'A section can have at most 100 fields.' };
  if (!entries.every(([k, v]) => KEY_PATTERN.test(k) && isFieldValue(v))) {
    return { success: false, error: 'Field keys start with a letter and use letters, numbers, - or _.' };
  }

  const db = getAdminDb();
  if (!db) return { success: false, error: 'Database not connected' };

  try {
    // No merge, so fields removed in the editor are removed here too.
    await siteCollection(db, siteId, 'siteContent').doc(sectionKey).set(Object.fromEntries(entries));
    revalidatePath('/admin/content');
    return { success: true };
  } catch (error) {
    console.error('Error saving content section:', error);
    return { success: false, error: 'Failed to save section' };
  }
}

export async function deleteContentSection(siteId: string, sectionKey: string) {
  if (!(await authorize('content'))) return { success: false, error: NO_ACCESS };
  if (siteId === DEFAULT_SITE_ID) return { success: false, error: 'Use the page editor for this website.' };
  if (!(await siteExists(siteId)) || !KEY_PATTERN.test(sectionKey)) return { success: false, error: 'Section not found.' };

  const db = getAdminDb();
  if (!db) return { success: false, error: 'Database not connected' };

  try {
    await siteCollection(db, siteId, 'siteContent').doc(sectionKey).delete();
    revalidatePath('/admin/content');
    return { success: true };
  } catch (error) {
    console.error('Error deleting content section:', error);
    return { success: false, error: 'Failed to delete section' };
  }
}

export async function updateSiteSettings(siteId: string, settings: Partial<SiteSettings>) {
  if (!(await authorize('settings'))) return { success: false, error: NO_ACCESS };
  if (!(await siteExists(siteId))) return { success: false, error: 'Website not found.' };
  const db = getAdminDb();
  if (!db) return { success: false, error: 'Database not connected' };

  try {
    await siteCollection(db, siteId, 'settings').doc('general').set(settings, { merge: true });
    if (siteId === DEFAULT_SITE_ID) revalidatePath('/', 'layout');
    revalidatePath('/admin/settings');
    return { success: true };
  } catch (error) {
    console.error('Error updating site settings:', error);
    return { success: false, error: 'Failed to update settings' };
  }
}
