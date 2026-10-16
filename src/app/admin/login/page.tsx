import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getAdminSession } from '@/middlewares/auth.middleware';
import { homePathFor } from '@/modules/auth/models/access.model';
import LoginForm from '@/modules/auth/components/LoginForm';
import { THEME_COOKIE, parseTheme } from '@/components/admin/theme';

export const metadata: Metadata = {
  title: 'Admin sign in',
  robots: { index: false, follow: false },
};

export default async function AdminLoginPage() {
  const user = await getAdminSession();
  if (user) redirect(homePathFor(user));
  const theme = parseTheme((await cookies()).get(THEME_COOKIE)?.value);
  return <LoginForm theme={theme} />;
}
