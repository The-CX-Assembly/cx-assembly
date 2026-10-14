'use server';

import { revalidatePath } from 'next/cache';
import { randomUUID } from 'node:crypto';
import { getAdminBucket, getAdminDb } from '@/lib/firebase-admin';
import { authorize } from '@/lib/auth-session';
import { Leader, CommunityVoice, SiteSettings, LeadStatus } from '@/types';

export async function updateLeadStatus(
  leadId: string,
  status: LeadStatus,
  notes?: string
) {
  if (!(await authorize('leads'))) return { success: false, error: 'You don’t have access to this section.' };
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

export async function updateSectionContent(
  sectionKey: string,
  data: Record<string, unknown>
) {
  if (!(await authorize('content'))) return { success: false, error: 'You don’t have access to this section.' };
  const db = getAdminDb();
  if (!db) return { success: false, error: 'Database not connected' };

  try {
    await db.collection('siteContent').doc(sectionKey).set(data, { merge: true });
    revalidatePath('/');
    revalidatePath('/founding-50');
    revalidatePath('/community-voices');
    revalidatePath('/privacy-policy');
    revalidatePath('/admin/content');
    return { success: true };
  } catch (error) {
    console.error('Error updating section content:', error);
    return { success: false, error: 'Failed to update content' };
  }
}

export async function saveLeader(leader: Omit<Leader, 'id'> & { id?: string }) {
  if (!(await authorize('leaders'))) return { success: false, error: 'You don’t have access to this section.' };
  const db = getAdminDb();
  if (!db) return { success: false, error: 'Database not connected' };

  try {
    const { id, ...data } = leader;
    const now = new Date().toISOString();

    if (id && !id.startsWith('temp-')) {
      await db
        .collection('leaders')
        .doc(id)
        .set({ ...data, updatedAt: now }, { merge: true });
    } else {
      await db.collection('leaders').add({
        ...data,
        createdAt: now,
        updatedAt: now,
      });
    }

    revalidatePath('/');
    revalidatePath('/founding-50');
    revalidatePath('/admin/leaders');
    return { success: true };
  } catch (error) {
    console.error('Error saving leader:', error);
    return { success: false, error: 'Failed to save leader' };
  }
}

export async function deleteLeader(leaderId: string) {
  if (!(await authorize('leaders'))) return { success: false, error: 'You don’t have access to this section.' };
  const db = getAdminDb();
  if (!db) return { success: false, error: 'Database not connected' };

  try {
    await db.collection('leaders').doc(leaderId).delete();
    revalidatePath('/founding-50');
    revalidatePath('/admin/leaders');
    return { success: true };
  } catch (error) {
    console.error('Error deleting leader:', error);
    return { success: false, error: 'Failed to delete leader' };
  }
}

export async function reorderLeaders(orderedIds: string[]) {
  if (!(await authorize('leaders'))) return { success: false, error: 'You don’t have access to this section.' };
  const db = getAdminDb();
  if (!db) return { success: false, error: 'Database not connected' };

  try {
    const batch = db.batch();
    orderedIds.forEach((id, index) => {
      const ref = db.collection('leaders').doc(id);
      batch.update(ref, { order: index + 1 });
    });
    await batch.commit();

    revalidatePath('/founding-50');
    revalidatePath('/admin/leaders');
    return { success: true };
  } catch (error) {
    console.error('Error reordering leaders:', error);
    return { success: false, error: 'Failed to reorder leaders' };
  }
}

export async function saveVoice(voice: Omit<CommunityVoice, 'id'> & { id?: string }) {
  if (!(await authorize('voices'))) return { success: false, error: 'You don’t have access to this section.' };
  const db = getAdminDb();
  if (!db) return { success: false, error: 'Database not connected' };

  try {
    const { id, ...data } = voice;
    if (id && !id.startsWith('temp-')) {
      await db.collection('voices').doc(id).set(data, { merge: true });
    } else {
      await db.collection('voices').add(data);
    }

    revalidatePath('/community-voices');
    revalidatePath('/admin/voices');
    return { success: true };
  } catch (error) {
    console.error('Error saving community voice:', error);
    return { success: false, error: 'Failed to save voice' };
  }
}

export async function deleteVoice(voiceId: string) {
  if (!(await authorize('voices'))) return { success: false, error: 'You don’t have access to this section.' };
  const db = getAdminDb();
  if (!db) return { success: false, error: 'Database not connected' };

  try {
    await db.collection('voices').doc(voiceId).delete();
    revalidatePath('/community-voices');
    revalidatePath('/admin/voices');
    return { success: true };
  } catch (error) {
    console.error('Error deleting voice:', error);
    return { success: false, error: 'Failed to delete voice' };
  }
}

export async function updateSiteSettings(settings: Partial<SiteSettings>) {
  if (!(await authorize('settings'))) return { success: false, error: 'You don’t have access to this section.' };
  const db = getAdminDb();
  if (!db) return { success: false, error: 'Database not connected' };

  try {
    await db.collection('settings').doc('general').set(settings, { merge: true });
    revalidatePath('/', 'layout');
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
  formData: FormData,
): Promise<{ success: true; url: string } | { success: false; error: string }> {
  if (!(await authorize('leaders'))) return { success: false, error: 'You don’t have access to this section.' };

  const file = formData.get('file');
  if (!(file instanceof File) || file.size === 0) return { success: false, error: 'Choose an image to upload.' };
  if (!file.type.startsWith('image/')) return { success: false, error: 'Only image files can be uploaded.' };
  if (file.size > MAX_UPLOAD_BYTES) return { success: false, error: 'Images must be under 5 MB.' };

  const bucket = getAdminBucket();
  if (!bucket) return { success: false, error: 'Storage not connected' };

  try {
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_').slice(-80);
    const path = `uploads/leaders/${Date.now()}_${safeName}`;
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
