import { getAdminSession } from '@/middlewares/auth.middleware';
import { getAdminSiteContext } from '@/modules/sites/services/admin-site.service';
import { getShellSummary } from '@/modules/dashboard/services/dashboard.service';
import { notificationFeed, siteNamesFor } from '@/modules/leads/services/notifications.service';
import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { THEME_COOKIE, parseTheme } from '@/components/admin/theme';
import AdminShell from '@/components/admin/AdminShell';

// The console is private: keep every admin page out of search results.
export const metadata: Metadata = {
  title: 'Admin console',
  robots: { index: false, follow: false },
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getAdminSession();

  // The login screen renders without the shell.
  if (!user) {
    return <main style={{ minHeight: '100vh' }}>{children}</main>;
  }

  const { sites, site } = await getAdminSiteContext();
  const { newLeads, speakerCount } = await getShellSummary(site?.id ?? null);
  const theme = parseTheme((await cookies()).get(THEME_COOKIE)?.value);

  return (
    <AdminShell
      user={{ email: user.email, name: user.name, role: user.role, sections: user.sections }}
      sites={sites.map((s) => ({ id: s.id, name: s.name, url: s.url, modules: s.modules }))}
      siteId={site?.id ?? null}
      speakerCount={speakerCount}
      notifications={notificationFeed(user, newLeads, siteNamesFor(sites))}
      theme={theme}
    >
      {children}
    </AdminShell>
  );
}
