import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getAdminSession } from '@/middlewares/auth.middleware';
import { homePathFor } from '@/modules/auth/models/access.model';
import LoginForm from '@/modules/auth/components/LoginForm';

export const metadata: Metadata = {
  title: 'Admin sign in',
  robots: { index: false, follow: false },
};

export default async function AdminLoginPage() {
  const user = await getAdminSession();
  if (user) redirect(homePathFor(user));
  return <LoginForm />;
}
