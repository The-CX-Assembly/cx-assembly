import { requireSection } from '@/lib/auth-session';
import { getAllLeadersAdmin } from '@/lib/content';
import LeadersManager from '@/components/admin/LeadersManager';

export default async function AdminLeadersPage() {
  await requireSection('leaders');

  const leaders = await getAllLeadersAdmin();

  return (
    <div className="container" style={{ paddingTop: '40px', paddingBottom: '60px' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '1.875rem', fontWeight: 800, color: 'var(--color-primary)', marginBottom: '6px' }}>
          Founding CX Leaders ({leaders.length})
        </h1>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9375rem' }}>
          Upload headshots, manage executive biographies, reorder leaders, and toggle publishing.
        </p>
      </div>

      <LeadersManager initialLeaders={leaders} />
    </div>
  );
}
