import { requireSection } from '@/middlewares/auth.middleware';
import { getAdminSiteContext } from '@/modules/sites/services/admin-site.service';
import { getSiteSettings } from '@/modules/content/services/content.service';
import SettingsManager from '@/modules/content/components/SettingsManager';
import ChooseSite from '@/modules/sites/components/ChooseSite';
import { PageHeader } from '@/components/admin/ui';
import ui from '@/components/admin/ui.module.css';

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
    <div className={ui.page}>
      <PageHeader title="Settings" />
      <SettingsManager key={site.id} siteId={site.id} siteUrl={site.url} initialSettings={settings} />
    </div>
  );
}
