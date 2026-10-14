import { requireSection } from '@/lib/auth-session';
import { getSiteSettings } from '@/lib/content';
import SettingsManager from '@/components/admin/SettingsManager';

export default async function AdminSettingsPage() {
  await requireSection('settings');

  const settings = await getSiteSettings();

  return (
    <div className="container" style={{ paddingTop: '40px', paddingBottom: '60px' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '1.875rem', fontWeight: 800, color: 'var(--color-primary)', marginBottom: '6px' }}>
          Website Settings
        </h1>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9375rem' }}>
          Configure global SEO metadata, social links, contact email, and platform credentials.
        </p>
      </div>

      <SettingsManager initialSettings={settings} />
    </div>
  );
}
