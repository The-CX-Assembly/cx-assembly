import { headers } from 'next/headers';
import { requireSuperadmin } from '@/lib/auth-session';
import { listSites } from '@/lib/sites';
import { getAllLeads } from '@/lib/admin-stats';
import { hasAdminCredentials } from '@/lib/firebase-admin';
import { siteIdOf } from '@/lib/site-constants';
import SitesManager from '@/components/admin/SitesManager';

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
    <div className="container" style={{ paddingTop: '40px', paddingBottom: '60px' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '1.875rem', fontWeight: 800, color: 'var(--color-primary)', marginBottom: '6px' }}>
          Websites ({sites.length})
        </h1>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9375rem', maxWidth: 760 }}>
          Every website managed from this dashboard. Each one gets an API key to send its form submissions here and
          fetch the content you edit. Switch between websites from the selector at the top of the page.
        </p>
      </div>

      <SitesManager sites={sites} leadCounts={leadCounts} baseUrl={baseUrl} canWrite={hasAdminCredentials()} />
    </div>
  );
}
