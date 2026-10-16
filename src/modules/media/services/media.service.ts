import 'server-only';
import { cache } from 'react';
import { createHmac, timingSafeEqual } from 'node:crypto';
import { getAdminDb } from '@/config/firebase-admin';
import { siteCollection } from '@/modules/sites/services/sites.service';
import { DEFAULT_SITE_ID } from '@/modules/sites/models/site.constants';
import { MediaSettings, Resource, Video } from '../models/media.model';

/** Everything starts switched off: nothing appears on the website until turned on. */
export const DEFAULT_MEDIA_SETTINGS: MediaSettings = {
  videosOnHome: false,
  videosPage: false,
  videosTitle: 'Watch the conversations',
  videosIntro: 'Highlights, interviews and talks from the community.',
  resourcesPage: false,
  resourcesTitle: 'Resources',
  resourcesIntro: 'Reports, playbooks and guides from the community.',
};

export const getMediaSettings = cache(async (siteId: string = DEFAULT_SITE_ID): Promise<MediaSettings> => {
  const db = getAdminDb();
  if (!db) return DEFAULT_MEDIA_SETTINGS;
  try {
    const doc = await siteCollection(db, siteId, 'settings').doc('media').get();
    return { ...DEFAULT_MEDIA_SETTINGS, ...(doc.data() as Partial<MediaSettings> | undefined) };
  } catch (error) {
    console.warn('Error reading media settings:', error);
    return DEFAULT_MEDIA_SETTINGS;
  }
});

async function readAll<T>(siteId: string, name: 'videos' | 'resources'): Promise<T[]> {
  const db = getAdminDb();
  if (!db) return [];
  try {
    const snap = await siteCollection(db, siteId, name).orderBy('order', 'asc').get();
    return snap.docs.map((doc) => ({ ...(doc.data() as Omit<T, 'id'>), id: doc.id }) as T);
  } catch (error) {
    console.warn(`Error reading ${name}:`, error);
    return [];
  }
}

/** Every video, drafts included, for the admin. */
export const getAllVideosAdmin = cache((siteId: string) => readAll<Video>(siteId, 'videos'));

/** Every PDF, drafts included, for the admin. */
export const getAllResourcesAdmin = cache((siteId: string) => readAll<Resource>(siteId, 'resources'));

/** Videos visitors may see: published ones, optionally only those picked for the home page. */
export async function getPublishedVideos(siteId: string = DEFAULT_SITE_ID, { home = false } = {}): Promise<Video[]> {
  const videos = await getAllVideosAdmin(siteId);
  return videos.filter((v) => v.published && (!home || v.showOnHome));
}

/** PDFs visitors may request. The storage path never leaves the server. */
export async function getPublishedResources(siteId: string = DEFAULT_SITE_ID): Promise<Omit<Resource, 'storagePath'>[]> {
  const resources = await getAllResourcesAdmin(siteId);
  return resources
    .filter((r) => r.published)
    .map(({ storagePath: _path, ...rest }) => rest); // eslint-disable-line @typescript-eslint/no-unused-vars
}

export async function getResource(siteId: string, id: string): Promise<Resource | null> {
  const db = getAdminDb();
  if (!db) return null;
  const doc = await siteCollection(db, siteId, 'resources').doc(id).get();
  return doc.exists ? ({ ...(doc.data() as Omit<Resource, 'id'>), id: doc.id } as Resource) : null;
}

// ---------- Download links ----------
// After a visitor submits the form they get a link that works for one PDF, for
// 15 minutes. Signed with the session secret (scoped by a prefix), so no
// database lookup is needed to check it.

const DOWNLOAD_TTL_SECONDS = 15 * 60;

function signingKey(): string | null {
  const secret = process.env.ADMIN_SESSION_SECRET;
  return secret && secret.length >= 32 ? `resource-download:${secret}` : null;
}

export function createDownloadToken(siteId: string, resourceId: string, now = Date.now()): string | null {
  const key = signingKey();
  if (!key) return null;
  const payload = Buffer.from(
    JSON.stringify({ s: siteId, r: resourceId, e: Math.floor(now / 1000) + DOWNLOAD_TTL_SECONDS }),
  ).toString('base64url');
  return `${payload}.${createHmac('sha256', key).update(payload).digest('base64url')}`;
}

export function verifyDownloadToken(token: string, now = Date.now()): { siteId: string; resourceId: string } | null {
  const key = signingKey();
  if (!key) return null;
  const [payload, signature] = token.split('.');
  if (!payload || !signature) return null;
  const expected = Buffer.from(createHmac('sha256', key).update(payload).digest('base64url'));
  const actual = Buffer.from(signature);
  if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) return null;
  try {
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    if (typeof data.s !== 'string' || typeof data.r !== 'string' || typeof data.e !== 'number') return null;
    if (data.e < Math.floor(now / 1000)) return null;
    return { siteId: data.s, resourceId: data.r };
  } catch {
    return null;
  }
}
