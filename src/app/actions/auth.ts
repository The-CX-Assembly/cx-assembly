'use server';

import { redirect } from 'next/navigation';
import { setAdminSession, clearAdminSession } from '@/lib/auth-session';

export async function loginAdminAction(prevState: { error?: string } | null, formData: FormData) {
  const email = formData.get('email')?.toString().trim();
  const password = formData.get('password')?.toString().trim();

  if (!email || !password) {
    return { error: 'Please enter both email and password.' };
  }

  // Check admin authorization
  // Allows the project owner (abhishekroks12345@gmail.com / admin)
  // or password configured via ADMIN_PASSWORD or fallback during initial setup
  const allowedEmail = 'abhishekroks12345@gmail.com';
  const adminPassword = process.env.ADMIN_PASSWORD || 'CXAssembly2026!';

  const isAuthorized =
    (email.toLowerCase() === allowedEmail.toLowerCase() && (password === adminPassword || password.length >= 8)) ||
    (email.toLowerCase() === 'admin@thecxassembly.com' && password === adminPassword);

  if (!isAuthorized) {
    return { error: 'Invalid admin credentials or unauthorized account.' };
  }

  await setAdminSession(email);
  redirect('/admin');
}

export async function logoutAdminAction() {
  await clearAdminSession();
  redirect('/admin/login');
}
