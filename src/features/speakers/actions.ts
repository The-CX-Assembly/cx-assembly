'use server';

import { randomUUID } from 'node:crypto';
import { getAdminBucket, getAdminDb } from '@/server/firebase-admin';
import { revalidateSite } from '@/server/revalidate';
import { NO_ACCESS, authorize } from '@/features/auth/session';
import { siteCollection, siteExists } from '@/features/sites/server';
import { DEFAULT_SITE_ID } from '@/features/sites/constants';
import { Speaker } from '@/types';

// Stored names predate the rename to "speakers": the Firestore collection, the
// admin permission key and the Storage folder are all still called "leaders".
const COLLECTION = 'leaders';
const PERMISSION = 'leaders';
const PUBLIC_PATHS = ['/', '/founding-50'];

export async function saveSpeaker(siteId: string, speaker: Omit<Speaker, 'id'> & { id?: string }) {
  if (!(await authorize(PERMISSION))) return { success: false, error: NO_ACCESS };
  if (!(await siteExists(siteId))) return { success: false, error: 'Website not found.' };
  const db = getAdminDb();
  if (!db) return { success: false, error: 'Database not connected' };

  try {
    const { id, ...data } = speaker;
    const now = new Date().toISOString();
    const speakers = siteCollection(db, siteId, COLLECTION);

    let savedId = id;
    if (id && !id.startsWith('temp-')) {
      await speakers.doc(id).set({ ...data, updatedAt: now }, { merge: true });
    } else {
      const ref = await speakers.add({
        ...data,
        createdAt: now,
        updatedAt: now,
      });
      savedId = ref.id;
    }

    revalidateSite(siteId, '/admin/speakers', PUBLIC_PATHS);
    // The editor keeps this id, so a later edit updates the same record.
    return { success: true, id: savedId };
  } catch (error) {
    console.error('Error saving speaker:', error);
    return { success: false, error: 'Failed to save speaker' };
  }
}

export async function deleteSpeaker(siteId: string, speakerId: string) {
  if (!(await authorize(PERMISSION))) return { success: false, error: NO_ACCESS };
  if (!(await siteExists(siteId))) return { success: false, error: 'Website not found.' };
  const db = getAdminDb();
  if (!db) return { success: false, error: 'Database not connected' };

  try {
    await siteCollection(db, siteId, COLLECTION).doc(speakerId).delete();
    revalidateSite(siteId, '/admin/speakers', PUBLIC_PATHS);
    return { success: true };
  } catch (error) {
    console.error('Error deleting speaker:', error);
    return { success: false, error: 'Failed to delete speaker' };
  }
}

export async function reorderSpeakers(siteId: string, orderedIds: string[]) {
  if (!(await authorize(PERMISSION))) return { success: false, error: NO_ACCESS };
  if (!(await siteExists(siteId))) return { success: false, error: 'Website not found.' };
  const db = getAdminDb();
  if (!db) return { success: false, error: 'Database not connected' };

  try {
    const speakers = siteCollection(db, siteId, COLLECTION);
    const batch = db.batch();
    orderedIds.forEach((id, index) => {
      batch.update(speakers.doc(id), { order: index + 1 });
    });
    await batch.commit();

    revalidateSite(siteId, '/admin/speakers', PUBLIC_PATHS);
    return { success: true };
  } catch (error) {
    console.error('Error reordering speakers:', error);
    return { success: false, error: 'Failed to reorder speakers' };
  }
}

const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;

/** Uploads a speaker headshot through the server so access rules apply. */
export async function uploadSpeakerPhoto(
  siteId: string,
  formData: FormData,
): Promise<{ success: true; url: string } | { success: false; error: string }> {
  if (!(await authorize(PERMISSION))) return { success: false, error: NO_ACCESS };
  if (!(await siteExists(siteId))) return { success: false, error: 'Website not found.' };

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
    console.error('Error uploading speaker photo:', error);
    return { success: false, error: 'Upload failed' };
  }
}
