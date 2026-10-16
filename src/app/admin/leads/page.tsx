import { requireSection } from '@/middlewares/auth.middleware';
import { getAdminSiteContext } from '@/modules/sites/services/admin-site.service';
import { getAllLeads } from '@/modules/dashboard/services/dashboard.service';
import { ALL_SITES } from '@/modules/sites/models/site.constants';
import LeadsManager from '@/modules/leads/components/LeadsManager';

export default async function AdminLeadsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string | string[]; lead?: string | string[] }>;
}) {
  await requireSection('leads');

  const { q, lead } = await searchParams;
  const first = (v?: string | string[]) => (Array.isArray(v) ? v[0] : v) ?? '';
  const initialSearch = first(q);
  // From a notification: open that lead's details.
  const initialLead = first(lead);

  const [leads, { sites, site }] = await Promise.all([getAllLeads(), getAdminSiteContext()]);
  // A search from the top bar, or a notification, looks across every website.
  const initialSite = initialSearch || initialLead || !site ? ALL_SITES : site.id;

  return (
    // Keyed so a new search, notification or website switch resets the filter state.
    <LeadsManager
      key={`${initialSearch}|${initialSite}|${initialLead}`}
      initialLeads={leads}
      initialSearch={initialSearch}
      initialLead={initialLead}
      initialSite={initialSite}
      sites={sites.map((s) => ({ id: s.id, name: s.name }))}
    />
  );
}
