import { getAdminSession } from '@/lib/auth-session';
import { buildShellLeads, getShellSummary } from '@/lib/admin-stats';
import { canAccess } from '@/lib/admin-sections';
import AdminShell from '@/components/admin/AdminShell';

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

  const { newLeads, recentLeads, leaderCount, voiceCount } = await getShellSummary();
  // Applicant names only go to people allowed to see the inbox.
  const canLeads = canAccess(user, 'leads');

  return (
    <AdminShell
      user={{ email: user.email, name: user.name, role: user.role, sections: user.sections }}
      newLeadsCount={canLeads ? newLeads.length : 0}
      leaderCount={leaderCount}
      voiceCount={voiceCount}
      recentLeads={canLeads ? buildShellLeads(recentLeads) : []}
      newLeads={canLeads ? buildShellLeads(newLeads).slice(0, 5) : []}
    >
      {children}
    </AdminShell>
  );
}
