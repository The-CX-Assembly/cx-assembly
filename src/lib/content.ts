import { cache } from 'react';
import { getAdminDb } from './firebase-admin';
import { siteCollection } from './sites';
import { DEFAULT_SITE_ID } from './site-constants';
import {
  defaultContent,
  defaultSettings,
  sampleLeaders,
  sampleVoices,
} from './default-content';
import { Leader, CommunityVoice, ContentSections, SiteContent, SiteSettings } from '@/types';

// Sample content only stands in for the original site; other sites start empty.
const sampleFor = <T,>(siteId: string, sample: T[]): T[] => (siteId === DEFAULT_SITE_ID ? sample : []);

const emptySettings: SiteSettings = {
  siteTitle: '',
  metaDescription: '',
  linkedinUrl: '',
  contactEmail: '',
  credibilityText: '',
  foundingCount: '',
};

/** The original site's typed page copy, with defaults for anything not yet edited. */
export async function getSiteContent(): Promise<SiteContent> {
  const db = getAdminDb();
  if (!db) return defaultContent;

  try {
    const snapshot = await siteCollection(db, DEFAULT_SITE_ID, 'siteContent').get();
    if (snapshot.empty) return defaultContent;

    const data: Partial<SiteContent> = {};
    snapshot.forEach((doc) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (data as any)[doc.id] = doc.data();
    });

    return {
      hero: { ...defaultContent.hero, ...data.hero },
      whyWeExist: { ...defaultContent.whyWeExist, ...data.whyWeExist },
      philosophy: { ...defaultContent.philosophy, ...data.philosophy },
      forLeaders: { ...defaultContent.forLeaders, ...data.forLeaders },
      forPartners: { ...defaultContent.forPartners, ...data.forPartners },
      aboutUs: { ...defaultContent.aboutUs, ...data.aboutUs },
      founding50: { ...defaultContent.founding50, ...data.founding50 },
      privacyPolicy: data.privacyPolicy || defaultContent.privacyPolicy,
    };
  } catch (error) {
    console.warn('Error reading siteContent from Firestore, using default:', error);
    return defaultContent;
  }
}

/** Any site's content as stored: section key → field → value. */
export async function getContentSections(siteId: string): Promise<ContentSections> {
  if (siteId === DEFAULT_SITE_ID) return (await getSiteContent()) as unknown as ContentSections;

  const db = getAdminDb();
  if (!db) return {};

  try {
    const snapshot = await siteCollection(db, siteId, 'siteContent').get();
    const sections: ContentSections = {};
    snapshot.forEach((doc) => {
      sections[doc.id] = doc.data() as ContentSections[string];
    });
    return sections;
  } catch (error) {
    console.warn(`Error reading content for site ${siteId}:`, error);
    return {};
  }
}

export async function getLeaders(siteId: string = DEFAULT_SITE_ID): Promise<Leader[]> {
  const db = getAdminDb();
  if (!db) return sampleFor(siteId, sampleLeaders);

  try {
    const snapshot = await siteCollection(db, siteId, 'leaders')
      .where('published', '==', true)
      .orderBy('order', 'asc')
      .get();

    const leaders: Leader[] = [];
    snapshot.forEach((doc) => {
      leaders.push({ id: doc.id, ...(doc.data() as Omit<Leader, 'id'>) });
    });
    return leaders.length > 0 ? leaders : sampleFor(siteId, sampleLeaders);
  } catch (error) {
    console.warn('Error reading leaders from Firestore, using sampleLeaders:', error);
    return sampleFor(siteId, sampleLeaders);
  }
}

// Cached per request so the admin layout and page share one query.
export const getAllLeadersAdmin = cache(async (siteId: string = DEFAULT_SITE_ID): Promise<Leader[]> => {
  const db = getAdminDb();
  if (!db) return sampleFor(siteId, sampleLeaders);

  try {
    const snapshot = await siteCollection(db, siteId, 'leaders').orderBy('order', 'asc').get();
    if (snapshot.empty) return sampleFor(siteId, sampleLeaders);

    const leaders: Leader[] = [];
    snapshot.forEach((doc) => {
      leaders.push({ id: doc.id, ...(doc.data() as Omit<Leader, 'id'>) });
    });
    return leaders;
  } catch (error) {
    console.warn('Error fetching all leaders:', error);
    return sampleFor(siteId, sampleLeaders);
  }
});

export async function getVoices(siteId: string = DEFAULT_SITE_ID): Promise<CommunityVoice[]> {
  const db = getAdminDb();
  if (!db) return sampleFor(siteId, sampleVoices);

  try {
    const snapshot = await siteCollection(db, siteId, 'voices')
      .where('published', '==', true)
      .orderBy('order', 'asc')
      .get();

    const voices: CommunityVoice[] = [];
    snapshot.forEach((doc) => {
      voices.push({ id: doc.id, ...(doc.data() as Omit<CommunityVoice, 'id'>) });
    });
    return voices.length > 0 ? voices : sampleFor(siteId, sampleVoices);
  } catch (error) {
    console.warn('Error reading voices from Firestore, using sampleVoices:', error);
    return sampleFor(siteId, sampleVoices);
  }
}

/** Every voice, drafts included, for the admin editor. */
export async function getAllVoicesAdmin(siteId: string): Promise<CommunityVoice[]> {
  const db = getAdminDb();
  if (!db) return sampleFor(siteId, sampleVoices);

  try {
    const snapshot = await siteCollection(db, siteId, 'voices').orderBy('order', 'asc').get();
    if (snapshot.empty) return sampleFor(siteId, sampleVoices);

    const voices: CommunityVoice[] = [];
    snapshot.forEach((doc) => {
      voices.push({ id: doc.id, ...(doc.data() as Omit<CommunityVoice, 'id'>) });
    });
    return voices;
  } catch (error) {
    console.warn('Error fetching all voices:', error);
    return sampleFor(siteId, sampleVoices);
  }
}

export async function getSiteSettings(siteId: string = DEFAULT_SITE_ID): Promise<SiteSettings> {
  const defaults = siteId === DEFAULT_SITE_ID ? defaultSettings : emptySettings;
  const db = getAdminDb();
  if (!db) return defaults;

  try {
    const doc = await siteCollection(db, siteId, 'settings').doc('general').get();
    if (!doc.exists) return defaults;
    return { ...defaults, ...(doc.data() as Partial<SiteSettings>) };
  } catch (error) {
    console.warn('Error reading settings from Firestore, using defaultSettings:', error);
    return defaults;
  }
}
