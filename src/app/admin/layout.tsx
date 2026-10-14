import { getAdminSession } from '@/lib/auth-session';
import { getAdminSiteContext } from '@/lib/admin-site';
import { buildShellLeads, getShellSummary } from '@/lib/admin-stats';
import { canAccess } from '@/lib/admin-sections';
import type { Metadata } from 'next';
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
    return <main style={{ minHeight: '100vh', backgroundColor: '#F5F6FA' }}>{children}</main>;
  }

  const { sites, site } = await getAdminSiteContext();
  const { newLeads, leaderCount } = await getShellSummary(site?.id ?? null);
  // Applicant names only go to people allowed to see the inbox.
  const canLeads = canAccess(user, 'leads');
  // With one website there's no need to say which one a lead came from.
  const siteNames = sites.length > 1 ? new Map(sites.map((s) => [s.id, s.name])) : undefined;

  return (
    <AdminShell
      user={{ email: user.email, name: user.name, role: user.role, sections: user.sections }}
      sites={sites.map((s) => ({ id: s.id, name: s.name, url: s.url, modules: s.modules }))}
      siteId={site?.id ?? null}
      newLeadsCount={canLeads ? newLeads.length : 0}
      leaderCount={leaderCount}
      newLeads={canLeads ? buildShellLeads(newLeads, siteNames).slice(0, 5) : []}
    >
      {children}
    </AdminShell>
  );
}
