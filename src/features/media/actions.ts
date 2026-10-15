'use server';

import { headers } from 'next/headers';
import { randomUUID } from 'node:crypto';
import { getAdminBucket, getAdminDb } from '@/server/firebase-admin';
import { revalidateSite } from '@/server/revalidate';
import { NO_ACCESS, authorize } from '@/features/auth/session';
import { siteCollection, siteExists } from '@/features/sites/server';
import { DEFAULT_SITE_ID } from '@/features/sites/constants';
import { MediaSettings, Resource, Video } from '@/types';
import { MAX_IMAGE_BYTES, MAX_PDF_BYTES, MAX_VIDEO_BYTES, VIDEO_TYPES, parseVideoUrl, youtubeThumbnail } from './embed';

type Fail = { success: false; error: string };
const fail = (error: string): Fail => ({ success: false, error });

const PUBLIC_PATHS = ['/', '/videos', '/resources'];

async function guard(siteId: string): Promise<Fail | null> {
  if (!(await authorize('media'))) return fail(NO_ACCESS);
  if (!(await siteExists(siteId))) return fail('Website not found.');
  return null;
}

// ---------- Uploads ----------
// Files go straight from the admin's browser to Cloud Storage: the server opens
// a resumable upload session for one object and hands the browser its URL.
// App Hosting caps request bodies at 32 MB, which rules out sending videos
// through a server action.

type UploadKind = 'video' | 'pdf' | 'image';

const RULES: Record<UploadKind, { types: (t: string) => boolean; max: number; label: string }> = {
  video: { types: (t) => VIDEO_TYPES.includes(t), max: MAX_VIDEO_BYTES, label: 'MP4, WebM or MOV video under 500 MB' },
  pdf: { types: (t) => t === 'application/pdf', max: MAX_PDF_BYTES, label: 'PDF under 50 MB' },
  image: { types: (t) => t.startsWith('image/'), max: MAX_IMAGE_BYTES, label: 'image under 5 MB' },
};

/** Public files live under uploads/; PDFs under private/ so they're only served after the form. */
function folderFor(siteId: string, kind: UploadKind): string {
  const base = kind === 'pdf' ? 'private' : 'uploads';
  const name = kind === 'pdf' ? 'resources' : kind === 'video' ? 'videos' : 'media-images';
  return siteId === DEFAULT_SITE_ID ? `${base}/${name}` : `${base}/sites/${siteId}/${name}`;
}

export async function startUpload(
  siteId: string,
  input: { kind: UploadKind; fileName: string; contentType: string; size: number },
): Promise<{ success: true; uploadUrl: string; path: string } | Fail> {
  const denied = await guard(siteId);
  if (denied) return denied;

  const rule = RULES[input.kind];
  if (!rule) return fail('Unknown upload type.');
  if (!rule.types(input.contentType) || !(input.size > 0) || input.size > rule.max) {
    return fail(`Choose a ${rule.label}.`);
  }

  const bucket = getAdminBucket();
  if (!bucket) return fail('Storage not connected');

  // The browser uploading the file must be this admin page: the session URL
  // only accepts uploads (and answers CORS) for the origin it was opened for.
  const origin = (await headers()).get('origin');
  if (!origin) return fail('Upload must start from the admin console.');

  const safeName = input.fileName.replace(/[^a-zA-Z0-9._-]/g, '_').slice(-80) || 'file';
  const path = `${folderFor(siteId, input.kind)}/${Date.now()}_${safeName}`;
  try {
    const [uploadUrl] = await bucket.file(path).createResumableUpload({
      origin,
      metadata: { contentType: input.contentType },
    });
    return { success: true, uploadUrl, path };
  } catch (error) {
    console.error('Error starting upload:', error);
    return fail('Couldn’t start the upload. Please try again.');
  }
}

/**
 * Checks the uploaded file. Public files (videos, images) get a download URL;
 * PDFs stay private and are referenced by path only.
 */
export async function finishUpload(
  siteId: string,
  input: { kind: UploadKind; path: string },
): Promise<{ success: true; url?: string; path: string; size: number } | Fail> {
  const denied = await guard(siteId);
  if (denied) return denied;
  const rule = RULES[input.kind];
  if (!rule || !input.path.startsWith(`${folderFor(siteId, input.kind)}/`)) return fail('Unexpected upload.');

  const bucket = getAdminBucket();
  if (!bucket) return fail('Storage not connected');
  const file = bucket.file(input.path);

  try {
    const [meta] = await file.getMetadata();
    const size = Number(meta.size ?? 0);
    if (!rule.types(String(meta.contentType ?? '')) || size > rule.max) {
      await file.delete({ ignoreNotFound: true });
      return fail(`Choose a ${rule.label}.`);
    }
    if (input.kind === 'pdf') return { success: true, path: input.path, size };

    const token = randomUUID();
    await file.setMetadata({ metadata: { firebaseStorageDownloadTokens: token } });
    const url = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(input.path)}?alt=media&token=${token}`;
    return { success: true, url, path: input.path, size };
  } catch (error) {
    console.error('Error finishing upload:', error);
    return fail('The upload didn’t complete. Please try again.');
  }
}

async function deleteStoredFile(path?: string) {
  if (!path) return;
  try {
    await getAdminBucket()?.file(path).delete({ ignoreNotFound: true });
  } catch (error) {
    console.warn('Could not delete stored file:', path, error);
  }
}

// ---------- Videos ----------

async function vimeoThumbnail(id: string): Promise<string | undefined> {
  try {
    const res = await fetch(`https://vimeo.com/api/oembed.json?url=${encodeURIComponent(`https://vimeo.com/${id}`)}`, {
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return undefined;
    const data = (await res.json()) as { thumbnail_url?: string };
    return data.thumbnail_url;
  } catch {
    return undefined;
  }
}

export type VideoDraft = Partial<Omit<Video, 'id'>> & { id?: string; link?: string };

export async function saveVideo(siteId: string, draft: VideoDraft): Promise<{ success: true; video: Video } | Fail> {
  const denied = await guard(siteId);
  if (denied) return denied;
  const db = getAdminDb();
  if (!db) return fail('Database not connected');

  const title = draft.title?.trim();
  if (!title) return fail('Give the video a title.');

  let provider: Video['provider'];
  let source: string;
  let originalUrl: string | undefined;
  let thumbnailUrl = draft.thumbnailUrl?.trim() || undefined;
  let storagePath: string | undefined;

  if (draft.provider === 'upload') {
    if (!draft.source || !draft.storagePath?.startsWith(`${folderFor(siteId, 'video')}/`)) return fail('Upload a video file first.');
    provider = 'upload';
    source = draft.source;
    storagePath = draft.storagePath;
  } else {
    const parsed = parseVideoUrl(draft.link ?? draft.originalUrl ?? '');
    if (!parsed) return fail('Paste a YouTube or Vimeo link, e.g. https://youtu.be/… or https://vimeo.com/…');
    provider = parsed.provider;
    source = parsed.id;
    originalUrl = (draft.link ?? draft.originalUrl ?? '').trim();
    if (!thumbnailUrl) thumbnailUrl = parsed.provider === 'youtube' ? youtubeThumbnail(parsed.id) : await vimeoThumbnail(parsed.id);
  }

  const now = new Date().toISOString();
  const videos = siteCollection(db, siteId, 'videos');
  const data = {
    title,
    description: draft.description?.trim() || '',
    provider,
    source,
    ...(originalUrl ? { originalUrl } : {}),
    ...(thumbnailUrl ? { thumbnailUrl } : {}),
    ...(storagePath ? { storagePath } : {}),
    published: Boolean(draft.published),
    showOnHome: Boolean(draft.showOnHome),
    updatedAt: now,
  };

  try {
    let id = draft.id;
    if (id) {
      const existing = (await videos.doc(id).get()).data() as Video | undefined;
      // Replacing an uploaded file removes the old one.
      if (existing?.storagePath && existing.storagePath !== storagePath) await deleteStoredFile(existing.storagePath);
      await videos.doc(id).set({ ...data, order: existing?.order ?? draft.order ?? 999 }, { merge: true });
    } else {
      const order = (await videos.count().get()).data().count + 1;
      id = (await videos.add({ ...data, order, createdAt: now })).id;
    }
    revalidateSite(siteId, '/admin/media', PUBLIC_PATHS);
    const saved = (await videos.doc(id).get()).data() as Omit<Video, 'id'>;
    return { success: true, video: { ...saved, id } };
  } catch (error) {
    console.error('Error saving video:', error);
    return fail('Failed to save the video');
  }
}

export async function deleteVideo(siteId: string, id: string): Promise<{ success: true } | Fail> {
  const denied = await guard(siteId);
  if (denied) return denied;
  const db = getAdminDb();
  if (!db) return fail('Database not connected');
  try {
    const ref = siteCollection(db, siteId, 'videos').doc(id);
    const video = (await ref.get()).data() as Video | undefined;
    await ref.delete();
    await deleteStoredFile(video?.storagePath);
    revalidateSite(siteId, '/admin/media', PUBLIC_PATHS);
    return { success: true };
  } catch (error) {
    console.error('Error deleting video:', error);
    return fail('Failed to delete the video');
  }
}

// ---------- PDFs ----------

export type ResourceDraft = Partial<Omit<Resource, 'id' | 'downloads'>> & { id?: string };

export async function saveResource(siteId: string, draft: ResourceDraft): Promise<{ success: true; resource: Resource } | Fail> {
  const denied = await guard(siteId);
  if (denied) return denied;
  const db = getAdminDb();
  if (!db) return fail('Database not connected');

  const title = draft.title?.trim();
  if (!title) return fail('Give the PDF a title.');
  if (!draft.storagePath?.startsWith(`${folderFor(siteId, 'pdf')}/`)) return fail('Upload the PDF first.');

  const now = new Date().toISOString();
  const resources = siteCollection(db, siteId, 'resources');
  const data = {
    title,
    description: draft.description?.trim() || '',
    storagePath: draft.storagePath,
    fileName: draft.fileName || draft.storagePath.split('/').pop() || 'document.pdf',
    fileSize: Number(draft.fileSize) || 0,
    ...(draft.coverUrl?.trim() ? { coverUrl: draft.coverUrl.trim() } : {}),
    published: Boolean(draft.published),
    updatedAt: now,
  };

  try {
    let id = draft.id;
    if (id) {
      const existing = (await resources.doc(id).get()).data() as Resource | undefined;
      if (existing?.storagePath && existing.storagePath !== data.storagePath) await deleteStoredFile(existing.storagePath);
      await resources.doc(id).set({ ...data, order: existing?.order ?? draft.order ?? 999 }, { merge: true });
    } else {
      const order = (await resources.count().get()).data().count + 1;
      id = (await resources.add({ ...data, order, downloads: 0, createdAt: now })).id;
    }
    revalidateSite(siteId, '/admin/media', PUBLIC_PATHS);
    const saved = (await resources.doc(id).get()).data() as Omit<Resource, 'id'>;
    return { success: true, resource: { ...saved, id } };
  } catch (error) {
    console.error('Error saving PDF:', error);
    return fail('Failed to save the PDF');
  }
}

export async function deleteResource(siteId: string, id: string): Promise<{ success: true } | Fail> {
  const denied = await guard(siteId);
  if (denied) return denied;
  const db = getAdminDb();
  if (!db) return fail('Database not connected');
  try {
    const ref = siteCollection(db, siteId, 'resources').doc(id);
    const resource = (await ref.get()).data() as Resource | undefined;
    await ref.delete();
    await deleteStoredFile(resource?.storagePath);
    revalidateSite(siteId, '/admin/media', PUBLIC_PATHS);
    return { success: true };
  } catch (error) {
    console.error('Error deleting PDF:', error);
    return fail('Failed to delete the PDF');
  }
}

// ---------- Shared ----------

export async function reorderMedia(
  siteId: string,
  kind: 'videos' | 'resources',
  orderedIds: string[],
): Promise<{ success: true } | Fail> {
  const denied = await guard(siteId);
  if (denied) return denied;
  const db = getAdminDb();
  if (!db) return fail('Database not connected');
  try {
    const col = siteCollection(db, siteId, kind);
    const batch = db.batch();
    orderedIds.forEach((id, index) => batch.update(col.doc(id), { order: index + 1 }));
    await batch.commit();
    revalidateSite(siteId, '/admin/media', PUBLIC_PATHS);
    return { success: true };
  } catch (error) {
    console.error('Error reordering media:', error);
    return fail('Failed to save the new order');
  }
}

export async function updateMediaSettings(siteId: string, patch: Partial<MediaSettings>): Promise<{ success: true } | Fail> {
  const denied = await guard(siteId);
  if (denied) return denied;
  const db = getAdminDb();
  if (!db) return fail('Database not connected');

  const allowed: (keyof MediaSettings)[] = [
    'videosOnHome',
    'videosPage',
    'videosTitle',
    'videosIntro',
    'resourcesPage',
    'resourcesTitle',
    'resourcesIntro',
  ];
  const clean = Object.fromEntries(
    Object.entries(patch ?? {}).filter(([k, v]) => allowed.includes(k as keyof MediaSettings) && ['boolean', 'string'].includes(typeof v)),
  );
  try {
    await siteCollection(db, siteId, 'settings').doc('media').set(clean, { merge: true });
    revalidateSite(siteId, '/admin/media', [...PUBLIC_PATHS, '/sitemap.xml']);
    return { success: true };
  } catch (error) {
    console.error('Error saving media settings:', error);
    return fail('Failed to save');
  }
}
