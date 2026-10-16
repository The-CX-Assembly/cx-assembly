import { requireSection } from '@/middlewares/auth.middleware';
import { getAdminSiteContext } from '@/modules/sites/services/admin-site.service';
import { getAllLeads } from '@/modules/dashboard/services/dashboard.service';
import { ALL_SITES } from '@/modules/sites/models/site.constants';
import LeadsManager from '@/modules/leads/components/LeadsManager';

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
