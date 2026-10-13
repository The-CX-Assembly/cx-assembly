import 'server-only';
import { getApps, initializeApp, cert, App } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import { getAuth, Auth } from 'firebase-admin/auth';

let adminApp: App | null = null;
let adminDb: Firestore | null = null;
let adminAuth: Auth | null = null;

export function getAdminApp(): App | null {
  if (adminApp) return adminApp;

  try {
    if (getApps().length > 0) {
      adminApp = getApps()[0];
      return adminApp;
    }

    const projectId = process.env.FIREBASE_PROJECT_ID || 'the-cx-assembly';
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

    if (clientEmail && privateKey) {
      adminApp = initializeApp({
        credential: cert({
          projectId,
          clientEmail,
          privateKey,
        }),
        projectId,
      });
    } else {
      // In Google Cloud Run / Firebase App Hosting, Application Default Credentials will be used automatically
      adminApp = initializeApp({ projectId });
    }

    return adminApp;
  } catch (error) {
    console.warn('Firebase Admin initialization note (normal in offline dev without ADC):', error);
    return null;
  }
}

export function getAdminDb(): Firestore | null {
  if (adminDb) return adminDb;
  const app = getAdminApp();
  if (!app) return null;
  try {
    adminDb = getFirestore(app);
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
