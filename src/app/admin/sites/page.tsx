import { headers } from 'next/headers';
import { requireSuperadmin } from '@/middlewares/auth.middleware';
import { listSites } from '@/modules/sites/services/sites.service';
import { getAllLeads } from '@/modules/dashboard/services/dashboard.service';
import { hasAdminCredentials } from '@/config/firebase-admin';
import { siteIdOf } from '@/modules/sites/models/site.constants';
import SitesManager from '@/modules/sites/components/SitesManager';
import { PageHeader } from '@/components/admin/ui';
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
      <PageHeader title="Websites" count={sites.length} />
      <SitesManager sites={sites} leadCounts={leadCounts} baseUrl={baseUrl} canWrite={hasAdminCredentials()} />
    </div>
  );
}
