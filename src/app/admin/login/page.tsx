import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getAdminSession } from '@/features/auth/session';
import { homePathFor } from '@/features/auth/sections';
import LoginForm from '@/features/auth/components/LoginForm';

export const metadata: Metadata = {
  title: 'Admin sign in',
  robots: { index: false, follow: false },
};

export default async function AdminLoginPage() {
  const user = await getAdminSession();
  if (user) redirect(homePathFor(user));
  return <LoginForm />;
}
