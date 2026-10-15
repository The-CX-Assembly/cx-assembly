import { requireSection } from '@/features/auth/session';
import { getAdminSiteContext } from '@/features/sites/admin-site';
import { getSiteSettings } from '@/features/content/server';
import SettingsManager from '@/features/content/components/SettingsManager';
import ChooseSite from '@/features/sites/components/ChooseSite';

export default async function AdminSettingsPage() {
  await requireSection('settings');
  const { sites, site } = await getAdminSiteContext();

  if (!site) {
    return (
      <ChooseSite title="Choose a website" message="Settings belong to one website. Pick which one to configure:" sites={sites} />
    );
  }

  const settings = await getSiteSettings(site.id);

  return (
    <div className="container" style={{ paddingTop: '40px', paddingBottom: '60px' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '1.875rem', fontWeight: 800, color: 'var(--color-primary)', marginBottom: '6px' }}>
          {site.name} Settings
        </h1>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9375rem' }}>
          Configure global SEO metadata, social links, contact email, and platform credentials.
        </p>
      </div>

      <SettingsManager key={site.id} siteId={site.id} initialSettings={settings} />
    </div>
  );
}
