import 'server-only';
import { existsSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { getApps, initializeApp, cert, App } from 'firebase-admin/app';
import { initializeFirestore, Firestore } from 'firebase-admin/firestore';
import { getAuth, Auth } from 'firebase-admin/auth';
import { getStorage } from 'firebase-admin/storage';

let adminApp: App | null = null;
let adminDb: Firestore | null = null;
let adminAuth: Auth | null = null;

/**
 * Whether Application Default Credentials are available. Production (App Hosting
 * build + runtime) always has them. In local dev, firebase-admin would otherwise
 * probe the GCE metadata server, stalling every Firestore call for ~9 seconds.
 */
function hasDefaultCredentials() {
  if (process.env.NODE_ENV === 'production') return true;
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS || process.env.FIRESTORE_EMULATOR_HOST) return true;

  const gcloudDir = process.env.APPDATA
    ? join(process.env.APPDATA, 'gcloud')
    : join(homedir(), '.config', 'gcloud');
  return existsSync(join(gcloudDir, 'application_default_credentials.json'));
}

let warnedNoCredentials = false;

/** True when server-side data access (Firestore, Storage, user management) can work. */
export function hasAdminCredentials() {
  const ok =
    Boolean(process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) || hasDefaultCredentials();
  if (!ok && !warnedNoCredentials) {
    warnedNoCredentials = true;
    console.warn(
      'Firebase Admin: no credentials found, so Firestore is disabled and sample content is served. ' +
        'Set FIREBASE_CLIENT_EMAIL and FIREBASE_PRIVATE_KEY in .env.local ' +
        '(or run "gcloud auth application-default login") to use live data.',
    );
  }
  return ok;
}

export function getAdminApp(): App | null {
  if (adminApp) return adminApp;

  try {
    if (getApps().length > 0) {
      adminApp = getApps()[0];
      return adminApp;
    }

    // App Hosting / Cloud Run set GOOGLE_CLOUD_PROJECT, so staging talks to the
    // staging project even if FIREBASE_PROJECT_ID is missing.
    const projectId =
      process.env.FIREBASE_PROJECT_ID ||
      process.env.GOOGLE_CLOUD_PROJECT ||
      process.env.GCLOUD_PROJECT ||
      process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ||
      'the-cx-assembly';
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

    // Without explicit credentials, Application Default Credentials are used (automatic on
    // Cloud Run / Firebase App Hosting). Verifying sign-in tokens needs no credentials at all.
    adminApp = initializeApp({
      ...(clientEmail && privateKey ? { credential: cert({ projectId, clientEmail, privateKey }) } : {}),
      projectId,
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || `${projectId}.firebasestorage.app`,
    });
    return adminApp;
  } catch (error) {
    console.warn('Firebase Admin initialization failed:', error);
    return null;
  }
}

export function getAdminDb(): Firestore | null {
  if (adminDb) return adminDb;
  if (!hasAdminCredentials()) return null;
  const app = getAdminApp();
  if (!app) return null;
  try {
    // REST transport avoids the slow gRPC channel setup on cold-started serverless instances.
    adminDb = initializeFirestore(app, { preferRest: true });
    return adminDb;
  } catch (error) {
    console.warn('Failed to get Firestore admin instance:', error);
    return null;
  }
}

export function getAdminAuth(): Auth | null {
  if (adminAuth) return adminAuth;
  const app = getAdminApp();
  if (!app) return null;
  try {
    adminAuth = getAuth(app);
    return adminAuth;
  } catch (error) {
    console.warn('Failed to get Auth admin instance:', error);
    return null;
  }
}

export function getAdminBucket() {
  if (!hasAdminCredentials()) return null;
  const app = getAdminApp();
  if (!app) return null;
  try {
    return getStorage(app).bucket();
  } catch (error) {
    console.warn('Failed to get Storage bucket:', error);
    return null;
  }
}
