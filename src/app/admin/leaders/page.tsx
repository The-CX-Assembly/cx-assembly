import { requireSection } from '@/lib/auth-session';
import { getAdminSiteContext, sitesWith } from '@/lib/admin-site';
import { getAllLeadersAdmin } from '@/lib/content';
import LeadersManager from '@/components/admin/LeadersManager';
import ChooseSite from '@/components/admin/ChooseSite';

export default async function AdminLeadersPage() {
  await requireSection('leaders');
  const { sites, site } = await getAdminSiteContext();

  if (!site?.modules.includes('leaders')) {
    return (
      <ChooseSite
        title="Choose a website"
        message={
          site
            ? `${site.name} doesn’t use leader profiles. A super admin can turn them on under Websites, or pick another website:`
            : 'Leader profiles belong to one website. Pick which one to manage:'
        }
        sites={sitesWith(sites, 'leaders')}
      />
    );
  }

  const leaders = await getAllLeadersAdmin(site.id);

  return (
    <div className="container" style={{ paddingTop: '40px', paddingBottom: '60px' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '1.875rem', fontWeight: 800, color: 'var(--color-primary)', marginBottom: '6px' }}>
          {site.builtIn ? 'Founding CX Leaders' : `${site.name} Leaders`} ({leaders.length})
        </h1>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9375rem' }}>
          Upload headshots, manage executive biographies, reorder leaders, and toggle publishing.
        </p>
      </div>

      {/* Keyed so switching websites resets the editor. */}
      <LeadersManager key={site.id} siteId={site.id} initialLeaders={leaders} />
    </div>
  );
}
