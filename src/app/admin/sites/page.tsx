import { headers } from 'next/headers';
import { requireSuperadmin } from '@/features/auth/session';
import { listSites } from '@/features/sites/server';
import { getAllLeads } from '@/features/dashboard/stats';
import { hasAdminCredentials } from '@/server/firebase-admin';
import { siteIdOf } from '@/features/sites/constants';
import SitesManager from '@/features/sites/components/SitesManager';
import { PageHeader } from '@/components/admin/ui';
import { IconGlobe } from '@/components/admin/AdminIcons';
import ui from '@/components/admin/ui.module.css';

/** The address other websites call, as seen by this request (works on any domain). */
async function apiBaseUrl() {
  const h = await headers();
  const host = h.get('x-forwarded-host') ?? h.get('host') ?? 'localhost:3000';
  const proto = h.get('x-forwarded-proto') ?? (host.startsWith('localhost') ? 'http' : 'https');
  return `${proto}://${host}`;
}

export default async function AdminSitesPage() {
  await requireSuperadmin();
  const [sites, leads, baseUrl] = await Promise.all([listSites(), getAllLeads(), apiBaseUrl()]);

  const leadCounts: Record<string, number> = {};
  for (const lead of leads) leadCounts[siteIdOf(lead)] = (leadCounts[siteIdOf(lead)] ?? 0) + 1;

  return (
    <div className={ui.page}>
      <PageHeader
        eyebrow="Super admin"
        icon={<IconGlobe size={14} />}
        title="Websites"
        count={sites.length}
        description="Every website managed from this dashboard. Each gets an API key to send its form submissions here and fetch the content you edit."
      />
      <SitesManager sites={sites} leadCounts={leadCounts} baseUrl={baseUrl} canWrite={hasAdminCredentials()} />
    </div>
  );
}
