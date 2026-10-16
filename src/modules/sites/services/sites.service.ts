import 'server-only';
import { cache } from 'react';
import { createHash, randomBytes } from 'node:crypto';
import type { CollectionReference, Firestore } from 'firebase-admin/firestore';
import { getAdminDb } from '@/config/firebase-admin';
import { DEFAULT_SITE_ID } from '../models/site.constants';
import { SITE_URL } from '@/modules/seo/utils/metadata';
import { Site, SiteModule } from '../models/site.model';

export const SITES_COLLECTION = 'sites';

/**
 * The website this app renders. Defined in code so it always exists; its stored
 * document only adds an API key, allowed origins and a URL override.
 */
const BUILT_IN_SITE: Site = {
  id: DEFAULT_SITE_ID,
  name: 'The CX Assembly',
  url: SITE_URL,
  allowedOrigins: [],
  modules: ['leaders'],
  builtIn: true,
};

const MODULES: SiteModule[] = ['leaders'];

/** What's stored in sites/{id}. The key hash never leaves the server. */
export interface StoredSite {
  name?: string;
  url?: string;
  allowedOrigins?: string[];
  modules?: SiteModule[];
  apiKeyHash?: string;
  apiKeyPrefix?: string;
  createdAt?: string;
  createdBy?: string;
  updatedAt?: string;
}

function toSite(id: string, stored: StoredSite | undefined): Site {
  if (id === DEFAULT_SITE_ID) {
    return {
      ...BUILT_IN_SITE,
      url: stored?.url || BUILT_IN_SITE.url,
      allowedOrigins: stored?.allowedOrigins ?? [],
      apiKeyPrefix: stored?.apiKeyPrefix,
      updatedAt: stored?.updatedAt,
    };
  }
  return {
    id,
    name: stored?.name || id,
    url: stored?.url || undefined,
    allowedOrigins: stored?.allowedOrigins ?? [],
    modules: (stored?.modules ?? []).filter((m) => MODULES.includes(m)),
    apiKeyPrefix: stored?.apiKeyPrefix,
    createdAt: stored?.createdAt,
    updatedAt: stored?.updatedAt,
  };
}

/** Every managed website, the original one first. Cached per request. */
export const listSites = cache(async (): Promise<Site[]> => {
  const db = getAdminDb();
  const stored = new Map<string, StoredSite>();

  if (db) {
    try {
      const snap = await db.collection(SITES_COLLECTION).get();
      snap.forEach((doc) => stored.set(doc.id, doc.data() as StoredSite));
    } catch (e) {
      console.warn('Could not list sites:', e);
    }
  }

  const others = [...stored.keys()]
    .filter((id) => id !== DEFAULT_SITE_ID)
    .map((id) => toSite(id, stored.get(id)))
    .sort((a, b) => a.name.localeCompare(b.name));

  return [toSite(DEFAULT_SITE_ID, stored.get(DEFAULT_SITE_ID)), ...others];
});

export async function getSite(id: string): Promise<Site | null> {
  return (await listSites()).find((s) => s.id === id) ?? null;
}

/** Guards actions that receive a site id from the browser. */
export async function siteExists(siteId: unknown): Promise<boolean> {
  return typeof siteId === 'string' && (await getSite(siteId)) !== null;
}

/**
 * Where a site's content lives. The original site keeps the top-level
 * collections it has always used; every other site gets its own subcollections
 * under sites/{id}, with the same names.
 */
export function siteCollection(
  db: Firestore,
  siteId: string,
  name: 'siteContent' | 'leaders' | 'voices' | 'settings' | 'videos' | 'resources',
): CollectionReference {
  return siteId === DEFAULT_SITE_ID
    ? db.collection(name)
    : db.collection(SITES_COLLECTION).doc(siteId).collection(name);
}

// ---- API keys -------------------------------------------------------------

const hashKey = (key: string) => createHash('sha256').update(key).digest('hex');

/** A new random key. Only its hash is stored, so it can be shown exactly once. */
export function generateApiKey(): { key: string; hash: string; prefix: string } {
  const key = `cxa_${randomBytes(24).toString('base64url')}`;
  return { key, hash: hashKey(key), prefix: key.slice(0, 10) };
}

/** The site an API key belongs to, or null. */
export async function getSiteByApiKey(key: string): Promise<Site | null> {
  const db = getAdminDb();
  if (!db || !key.startsWith('cxa_')) return null;
  try {
    const snap = await db.collection(SITES_COLLECTION).where('apiKeyHash', '==', hashKey(key)).limit(1).get();
    if (snap.empty) return null;
    const doc = snap.docs[0];
    return toSite(doc.id, doc.data() as StoredSite);
  } catch (e) {
    console.warn('Could not look up API key:', e);
    return null;
  }
}

/** Whether any site lists this browser origin (used to answer CORS preflights). */
export async function isAllowedOrigin(origin: string): Promise<boolean> {
  const db = getAdminDb();
  if (!db) return false;
  try {
    const snap = await db
      .collection(SITES_COLLECTION)
      .where('allowedOrigins', 'array-contains', origin)
      .limit(1)
      .get();
    return !snap.empty;
  } catch (e) {
    console.warn('Could not check allowed origin:', e);
    return false;
  }
}
