'use server';

import { revalidatePath } from 'next/cache';
import { randomUUID } from 'node:crypto';
import { getAdminBucket, getAdminDb } from '@/lib/firebase-admin';
import { authorize } from '@/lib/auth-session';
import { getSite, siteCollection } from '@/lib/sites';
import { DEFAULT_SITE_ID } from '@/lib/site-constants';
import { Leader, CommunityVoice, SiteSettings, LeadStatus, ContentFieldValue } from '@/types';

const NO_ACCESS = 'You don’t have access to this section.';

/**
 * Refreshes the admin page and, for the website this app renders, the public
 * pages showing that data. Other websites fetch from the API on their own schedule.
 */
function revalidateSite(siteId: string, adminPath: string, publicPaths: string[]) {
  revalidatePath(adminPath);
  if (siteId === DEFAULT_SITE_ID) publicPaths.forEach((p) => revalidatePath(p));
}

async function knownSite(siteId: string) {
  return typeof siteId === 'string' && (await getSite(siteId)) !== null;
}

export async function updateLeadStatus(
  leadId: string,
  status: LeadStatus,
  notes?: string
) {
  if (!(await authorize('leads'))) return { success: false, error: NO_ACCESS };
  const db = getAdminDb();
  if (!db) return { success: false, error: 'Database not connected' };

  try {
    const updateData: Record<string, unknown> = { status };
    if (notes !== undefined) updateData.notes = notes;

    await db.collection('leads').doc(leadId).update(updateData);
    revalidatePath('/admin/leads');
    return { success: true };
  } catch (error) {
    console.error('Error updating lead status:', error);
    return { success: false, error: 'Failed to update lead status' };
  }
}

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
  if (!(await knownSite(siteId))) return { success: false, error: 'Website not found.' };
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
  if (!(await knownSite(siteId)) || !KEY_PATTERN.test(sectionKey)) return { success: false, error: 'Section not found.' };

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

export async function saveLeader(siteId: string, leader: Omit<Leader, 'id'> & { id?: string }) {
  if (!(await authorize('leaders'))) return { success: false, error: NO_ACCESS };
  if (!(await knownSite(siteId))) return { success: false, error: 'Website not found.' };
  const db = getAdminDb();
  if (!db) return { success: false, error: 'Database not connected' };

  try {
    const { id, ...data } = leader;
    const now = new Date().toISOString();
    const leaders = siteCollection(db, siteId, 'leaders');

    if (id && !id.startsWith('temp-')) {
      await leaders.doc(id).set({ ...data, updatedAt: now }, { merge: true });
    } else {
      await leaders.add({
        ...data,
        createdAt: now,
        updatedAt: now,
      });
    }

    revalidateSite(siteId, '/admin/leaders', ['/', '/founding-50']);
    return { success: true };
  } catch (error) {
    console.error('Error saving leader:', error);
    return { success: false, error: 'Failed to save leader' };
  }
}

export async function deleteLeader(siteId: string, leaderId: string) {
  if (!(await authorize('leaders'))) return { success: false, error: NO_ACCESS };
  if (!(await knownSite(siteId))) return { success: false, error: 'Website not found.' };
  const db = getAdminDb();
  if (!db) return { success: false, error: 'Database not connected' };

  try {
    await siteCollection(db, siteId, 'leaders').doc(leaderId).delete();
    revalidateSite(siteId, '/admin/leaders', ['/', '/founding-50']);
    return { success: true };
  } catch (error) {
    console.error('Error deleting leader:', error);
    return { success: false, error: 'Failed to delete leader' };
  }
}

export async function reorderLeaders(siteId: string, orderedIds: string[]) {
  if (!(await authorize('leaders'))) return { success: false, error: NO_ACCESS };
  if (!(await knownSite(siteId))) return { success: false, error: 'Website not found.' };
  const db = getAdminDb();
  if (!db) return { success: false, error: 'Database not connected' };

  try {
    const leaders = siteCollection(db, siteId, 'leaders');
    const batch = db.batch();
    orderedIds.forEach((id, index) => {
      batch.update(leaders.doc(id), { order: index + 1 });
    });
    await batch.commit();

    revalidateSite(siteId, '/admin/leaders', ['/', '/founding-50']);
    return { success: true };
  } catch (error) {
    console.error('Error reordering leaders:', error);
    return { success: false, error: 'Failed to reorder leaders' };
  }
}

export async function saveVoice(siteId: string, voice: Omit<CommunityVoice, 'id'> & { id?: string }) {
  if (!(await authorize('voices'))) return { success: false, error: NO_ACCESS };
  if (!(await knownSite(siteId))) return { success: false, error: 'Website not found.' };
  const db = getAdminDb();
  if (!db) return { success: false, error: 'Database not connected' };

  try {
    const { id, ...data } = voice;
    const voices = siteCollection(db, siteId, 'voices');
    if (id && !id.startsWith('temp-')) {
      await voices.doc(id).set(data, { merge: true });
    } else {
      await voices.add(data);
    }

    revalidateSite(siteId, '/admin/voices', ['/community-voices']);
    return { success: true };
  } catch (error) {
    console.error('Error saving community voice:', error);
    return { success: false, error: 'Failed to save voice' };
  }
}

export async function deleteVoice(siteId: string, voiceId: string) {
  if (!(await authorize('voices'))) return { success: false, error: NO_ACCESS };
  if (!(await knownSite(siteId))) return { success: false, error: 'Website not found.' };
  const db = getAdminDb();
  if (!db) return { success: false, error: 'Database not connected' };

  try {
    await siteCollection(db, siteId, 'voices').doc(voiceId).delete();
    revalidateSite(siteId, '/admin/voices', ['/community-voices']);
    return { success: true };
  } catch (error) {
    console.error('Error deleting voice:', error);
    return { success: false, error: 'Failed to delete voice' };
  }
}

export async function updateSiteSettings(siteId: string, settings: Partial<SiteSettings>) {
  if (!(await authorize('settings'))) return { success: false, error: NO_ACCESS };
  if (!(await knownSite(siteId))) return { success: false, error: 'Website not found.' };
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

const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;

/** Uploads a leader headshot through the server so access rules apply. */
export async function uploadLeaderPhoto(
  siteId: string,
  formData: FormData,
): Promise<{ success: true; url: string } | { success: false; error: string }> {
  if (!(await authorize('leaders'))) return { success: false, error: NO_ACCESS };
  if (!(await knownSite(siteId))) return { success: false, error: 'Website not found.' };

  const file = formData.get('file');
  if (!(file instanceof File) || file.size === 0) return { success: false, error: 'Choose an image to upload.' };
  if (!file.type.startsWith('image/')) return { success: false, error: 'Only image files can be uploaded.' };
  if (file.size > MAX_UPLOAD_BYTES) return { success: false, error: 'Images must be under 5 MB.' };

  const bucket = getAdminBucket();
  if (!bucket) return { success: false, error: 'Storage not connected' };

  try {
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_').slice(-80);
    const folder = siteId === DEFAULT_SITE_ID ? 'uploads/leaders' : `uploads/sites/${siteId}/leaders`;
    const path = `${folder}/${Date.now()}_${safeName}`;
    const token = randomUUID();
    await bucket.file(path).save(Buffer.from(await file.arrayBuffer()), {
      contentType: file.type,
      metadata: { metadata: { firebaseStorageDownloadTokens: token } },
    });
    const url = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(path)}?alt=media&token=${token}`;
    return { success: true, url };
  } catch (error) {
    console.error('Error uploading leader photo:', error);
    return { success: false, error: 'Upload failed' };
  }
}
