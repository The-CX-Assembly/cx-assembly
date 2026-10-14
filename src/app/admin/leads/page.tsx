import { requireSection } from '@/lib/auth-session';
import { getAllLeads } from '@/lib/admin-stats';
import LeadsManager from '@/components/admin/LeadsManager';

export default async function AdminLeadsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string | string[] }>;
}) {
  await requireSection('leads');

  const { q } = await searchParams;
  const initialSearch = (Array.isArray(q) ? q[0] : q) ?? '';

  const leads = await getAllLeads();

  return (
    <div className="container" style={{ paddingTop: '40px', paddingBottom: '60px' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '1.875rem', fontWeight: 800, color: 'var(--color-primary)', marginBottom: '6px' }}>
          Applications & Inquiries ({leads.length})
        </h1>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9375rem' }}>
          Review membership applications from brand-side CX heads and partnership requests. Export anytime to CSV.
        </p>
      </div>

      {/* Keyed so a new search from the top bar resets the filter state. */}
      <LeadsManager key={initialSearch} initialLeads={leads} initialSearch={initialSearch} />
    </div>
  );
}
