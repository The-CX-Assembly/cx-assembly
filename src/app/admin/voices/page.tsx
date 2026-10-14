import { requireSection } from '@/lib/auth-session';
import { getAdminSiteContext, sitesWith } from '@/lib/admin-site';
import { getAllVoicesAdmin } from '@/lib/content';
import VoicesManager from '@/components/admin/VoicesManager';
import ChooseSite from '@/components/admin/ChooseSite';

export default async function AdminVoicesPage() {
  await requireSection('voices');
  const { sites, site } = await getAdminSiteContext();

  if (!site?.modules.includes('voices')) {
    return (
      <ChooseSite
        title="Choose a website"
        message={
          site
            ? `${site.name} doesn’t use testimonials. A super admin can turn them on under Websites, or pick another website:`
            : 'Testimonials belong to one website. Pick which one to manage:'
        }
        sites={sitesWith(sites, 'voices')}
      />
    );
  }

  // Drafts included, so unpublished quotes can be edited and published again.
  const voices = await getAllVoicesAdmin(site.id);

  return (
    <div className="container" style={{ paddingTop: '40px', paddingBottom: '60px' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '1.875rem', fontWeight: 800, color: 'var(--color-primary)', marginBottom: '6px' }}>
          {site.builtIn ? 'Community Voices' : `${site.name} Testimonials`} ({voices.length})
        </h1>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9375rem' }}>
          Add, edit, or remove executive quotes that appear on the website.
        </p>
      </div>

      {/* Keyed so switching websites resets the editor. */}
      <VoicesManager key={site.id} siteId={site.id} initialVoices={voices} />
    </div>
  );
}
