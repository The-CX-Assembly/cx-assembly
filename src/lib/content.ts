import { getAdminDb } from './firebase-admin';
import {
  defaultContent,
  defaultSettings,
  sampleLeaders,
  sampleVoices,
} from './default-content';
import { Leader, CommunityVoice, SiteContent, SiteSettings } from '@/types';

export async function getSiteContent(): Promise<SiteContent> {
  const db = getAdminDb();
  if (!db) return defaultContent;

  try {
    const snapshot = await db.collection('siteContent').get();
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

export async function getLeaders(): Promise<Leader[]> {
  const db = getAdminDb();
  if (!db) return sampleLeaders;

  try {
    const snapshot = await db
      .collection('leaders')
      .where('published', '==', true)
      .orderBy('order', 'asc')
      .get();

    if (snapshot.empty) return sampleLeaders;

    const leaders: Leader[] = [];
    snapshot.forEach((doc) => {
      leaders.push({ id: doc.id, ...(doc.data() as Omit<Leader, 'id'>) });
    });
    return leaders.length > 0 ? leaders : sampleLeaders;
  } catch (error) {
    console.warn('Error reading leaders from Firestore, using sampleLeaders:', error);
    return sampleLeaders;
  }
}

export async function getAllLeadersAdmin(): Promise<Leader[]> {
  const db = getAdminDb();
  if (!db) return sampleLeaders;

  try {
    const snapshot = await db.collection('leaders').orderBy('order', 'asc').get();
    if (snapshot.empty) return sampleLeaders;

    const leaders: Leader[] = [];
    snapshot.forEach((doc) => {
      leaders.push({ id: doc.id, ...(doc.data() as Omit<Leader, 'id'>) });
    });
    return leaders;
  } catch (error) {
    console.warn('Error fetching all leaders:', error);
    return sampleLeaders;
  }
}

export async function getVoices(): Promise<CommunityVoice[]> {
  const db = getAdminDb();
  if (!db) return sampleVoices;

  try {
    const snapshot = await db
      .collection('voices')
      .where('published', '==', true)
      .orderBy('order', 'asc')
      .get();

    if (snapshot.empty) return sampleVoices;

    const voices: CommunityVoice[] = [];
    snapshot.forEach((doc) => {
      voices.push({ id: doc.id, ...(doc.data() as Omit<CommunityVoice, 'id'>) });
    });
    return voices.length > 0 ? voices : sampleVoices;
  } catch (error) {
    console.warn('Error reading voices from Firestore, using sampleVoices:', error);
    return sampleVoices;
  }
}

export async function getSiteSettings(): Promise<SiteSettings> {
  const db = getAdminDb();
  if (!db) return defaultSettings;

  try {
    const doc = await db.collection('settings').doc('general').get();
    if (!doc.exists) return defaultSettings;
    return { ...defaultSettings, ...(doc.data() as Partial<SiteSettings>) };
  } catch (error) {
    console.warn('Error reading settings from Firestore, using defaultSettings:', error);
    return defaultSettings;
  }
}
