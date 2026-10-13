import { NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase-admin';
import {
  defaultContent,
  defaultSettings,
  sampleLeaders,
  sampleVoices,
} from '@/lib/default-content';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get('secret');

  if (secret !== 'CXAssembly2026!' && secret !== process.env.ADMIN_SESSION_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const db = getAdminDb();
  if (!db) {
    return NextResponse.json({ error: 'Admin DB not initialized' }, { status: 500 });
  }

  try {
    // 1. Seed Site Content
    await db.collection('siteContent').doc('hero').set(defaultContent.hero);
    await db.collection('siteContent').doc('whyWeExist').set(defaultContent.whyWeExist);
    await db.collection('siteContent').doc('philosophy').set(defaultContent.philosophy);
    await db.collection('siteContent').doc('forLeaders').set(defaultContent.forLeaders);
    await db.collection('siteContent').doc('forPartners').set(defaultContent.forPartners);
    await db.collection('siteContent').doc('aboutUs').set(defaultContent.aboutUs);
    await db.collection('siteContent').doc('founding50').set(defaultContent.founding50);
    await db.collection('siteContent').doc('privacy').set({ privacyPolicy: defaultContent.privacyPolicy });

    // 2. Seed Settings
    await db.collection('settings').doc('general').set(defaultSettings);

    // 3. Seed Leaders
    for (const leader of sampleLeaders) {
      const { id, ...data } = leader;
      await db.collection('leaders').doc(id).set(data);
    }

    // 4. Seed Voices
    for (const voice of sampleVoices) {
      const { id, ...data } = voice;
      await db.collection('voices').doc(id).set(data);
    }

    return NextResponse.json({
      success: true,
      message: 'Firestore collections successfully populated with CX Assembly data!',
      counts: {
        leaders: sampleLeaders.length,
        voices: sampleVoices.length,
      },
    });
  } catch (error) {
    console.error('Error seeding via endpoint:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
