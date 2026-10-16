import 'server-only';
import { cache } from 'react';
import { getAdminDb } from '@/config/firebase-admin';
import { siteCollection } from '@/modules/sites/services/sites.service';
import { DEFAULT_SITE_ID } from '@/modules/sites/models/site.constants';
import { sampleFor, sampleSpeakers } from '@/modules/content/models/content.defaults';
import { Speaker } from '../models/speaker.model';

// CMO Speakers are stored in each site's "leaders" collection, their name
// before the rename. Changing it would need a data migration, so it stays.
const COLLECTION = 'leaders';

/** Published speakers in display order, for the public site. */
export async function getSpeakers(siteId: string = DEFAULT_SITE_ID): Promise<Speaker[]> {
  const db = getAdminDb();
  if (!db) return sampleFor(siteId, sampleSpeakers);

  try {
    // Filtering on published while ordering by order would need a composite
    // index; without it the query fails, so filter here instead (lists are small).
    const snapshot = await siteCollection(db, siteId, COLLECTION).orderBy('order', 'asc').get();
    // Samples only stand in for a site that has never added any.
    if (snapshot.empty) return sampleFor(siteId, sampleSpeakers);

    const speakers: Speaker[] = [];
    snapshot.forEach((doc) => {
      const data = doc.data() as Omit<Speaker, 'id'>;
      if (data.published) speakers.push({ ...data, id: doc.id });
    });
    return speakers;
  } catch (error) {
    console.error('Error reading speakers from Firestore, using samples:', error);
    return sampleFor(siteId, sampleSpeakers);
  }
}

/** Every speaker, drafts included, for the admin. Cached so the layout and page share one query. */
export const getAllSpeakersAdmin = cache(async (siteId: string = DEFAULT_SITE_ID): Promise<Speaker[]> => {
  const db = getAdminDb();
  if (!db) return sampleFor(siteId, sampleSpeakers);

  try {
    const snapshot = await siteCollection(db, siteId, COLLECTION).orderBy('order', 'asc').get();
    if (snapshot.empty) return sampleFor(siteId, sampleSpeakers);

    const speakers: Speaker[] = [];
    snapshot.forEach((doc) => {
      speakers.push({ id: doc.id, ...(doc.data() as Omit<Speaker, 'id'>) });
    });
    return speakers;
  } catch (error) {
    console.warn('Error fetching all speakers:', error);
    return sampleFor(siteId, sampleSpeakers);
  }
});
