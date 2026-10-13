import { getApps, initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import {
  defaultContent,
  defaultSettings,
  sampleLeaders,
  sampleVoices,
} from '../src/lib/default-content';

async function main() {
  const projectId = process.env.FIREBASE_PROJECT_ID || 'the-cx-assembly';
  console.log(`Seeding Firestore for project: ${projectId}...`);

  const app = getApps().length > 0 ? getApps()[0] : initializeApp({ projectId });
  const db = getFirestore(app);

  // 1. Seed Site Content
  console.log('Seeding siteContent collection...');
  await db.collection('siteContent').doc('hero').set(defaultContent.hero);
  await db.collection('siteContent').doc('whyWeExist').set(defaultContent.whyWeExist);
  await db.collection('siteContent').doc('philosophy').set(defaultContent.philosophy);
  await db.collection('siteContent').doc('forLeaders').set(defaultContent.forLeaders);
  await db.collection('siteContent').doc('forPartners').set(defaultContent.forPartners);
  await db.collection('siteContent').doc('aboutUs').set(defaultContent.aboutUs);
  await db.collection('siteContent').doc('founding50').set(defaultContent.founding50);
  await db.collection('siteContent').doc('privacy').set({ privacyPolicy: defaultContent.privacyPolicy });

  // 2. Seed Settings
  console.log('Seeding settings collection...');
  await db.collection('settings').doc('general').set(defaultSettings);

  // 3. Seed Leaders
  console.log('Seeding leaders collection...');
  for (const leader of sampleLeaders) {
    const { id, ...data } = leader;
    await db.collection('leaders').doc(id).set(data);
  }

  // 4. Seed Voices
  console.log('Seeding voices collection...');
  for (const voice of sampleVoices) {
    const { id, ...data } = voice;
    await db.collection('voices').doc(id).set(data);
  }

  console.log('✅ Firestore seed completed successfully!');
}

main().catch((err) => {
  console.error('Seed script error:', err);
  process.exit(1);
});
