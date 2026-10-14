import { requireSection } from '@/lib/auth-session';
import { getAdminSiteContext } from '@/lib/admin-site';
import { getAllLeads } from '@/lib/admin-stats';
import { ALL_SITES } from '@/lib/site-constants';
import LeadsManager from '@/components/admin/LeadsManager';

export default async function AdminLeadsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string | string[] }>;
}) {
  await requireSection('leads');

  const { q } = await searchParams;
  const initialSearch = (Array.isArray(q) ? q[0] : q) ?? '';

  const [leads, { sites, site }] = await Promise.all([getAllLeads(), getAdminSiteContext()]);
  // A search from the top bar looks across every website.
  const initialSite = initialSearch || !site ? ALL_SITES : site.id;

  return (
    <div className="container" style={{ paddingTop: '40px', paddingBottom: '60px' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '1.875rem', fontWeight: 800, color: 'var(--color-primary)', marginBottom: '6px' }}>
          Applications & Inquiries ({leads.length})
        </h1>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9375rem' }}>
          Every form submission from every website, with the button and page it came from. Export anytime to CSV.
        </p>
      </div>

      {/* Keyed so a new search or website switch resets the filter state. */}
      <LeadsManager
        key={`${initialSearch}|${initialSite}`}
        initialLeads={leads}
        initialSearch={initialSearch}
        initialSite={initialSite}
        sites={sites.map((s) => ({ id: s.id, name: s.name }))}
      />
    </div>
  );
}
