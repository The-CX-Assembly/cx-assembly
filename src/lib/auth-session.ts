import { cookies } from 'next/headers';

const COOKIE_NAME = 'cx_admin_session';

export async function setAdminSession(email: string) {
  const cookieStore = await cookies();
  const tokenPayload = {
    email,
    loggedInAt: Date.now(),
    role: 'admin',
  };

  const tokenString = Buffer.from(JSON.stringify(tokenPayload)).toString('base64');

  cookieStore.set(COOKIE_NAME, tokenString, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  });
}

export async function getAdminSession(): Promise<{ email: string; role: string } | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(COOKIE_NAME);
  if (!sessionCookie || !sessionCookie.value) return null;

  try {
    const decoded = JSON.parse(Buffer.from(sessionCookie.value, 'base64').toString('utf-8'));
    if (decoded && decoded.email && decoded.role === 'admin') {
      return { email: decoded.email, role: decoded.role };
    }
    return null;
  } catch {
    return null;
  }
}

export async function clearAdminSession() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}
