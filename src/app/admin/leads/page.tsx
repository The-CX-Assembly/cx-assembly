import { requireSection } from '@/features/auth/session';
import { getAdminSiteContext } from '@/features/sites/admin-site';
import { getAllLeads } from '@/features/dashboard/stats';
import { ALL_SITES } from '@/features/sites/constants';
import LeadsManager from '@/features/leads/components/LeadsManager';

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
    // Keyed so a new search or website switch resets the filter state.
    <LeadsManager
      key={`${initialSearch}|${initialSite}`}
      initialLeads={leads}
      initialSearch={initialSearch}
      initialSite={initialSite}
      sites={sites.map((s) => ({ id: s.id, name: s.name }))}
    />
  );
}
