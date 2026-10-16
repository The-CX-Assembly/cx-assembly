import { NextResponse } from 'next/server';
import { timingSafeEqual } from 'node:crypto';
import { getAdminDb } from '@/config/firebase-admin';
import { getAdminSession } from '@/middlewares/auth.middleware';
import {
  defaultContent,
  defaultSettings,
  sampleSpeakers,
  sampleVoices,
} from '@/modules/content/models/content.defaults';

function hasSeedSecret(request: Request) {
  const expected = process.env.ADMIN_SESSION_SECRET;
  const given = request.headers.get('x-seed-secret');
  if (!expected || expected.length < 32 || !given) return false;
  const a = Buffer.from(given);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

// Overwrites live content, so only a signed-in super admin (or a caller holding the
// server secret in the x-seed-secret header) may run it.
export async function GET(request: Request) {
  const user = await getAdminSession();
  if (user?.role !== 'superadmin' && !hasSeedSecret(request)) {
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

    // 3. Seed CMO Speakers (stored in the "leaders" collection)
    for (const speaker of sampleSpeakers) {
      const { id, ...data } = speaker;
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
        speakers: sampleSpeakers.length,
        voices: sampleVoices.length,
      },
    });
  } catch (error) {
    console.error('Error seeding via endpoint:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
