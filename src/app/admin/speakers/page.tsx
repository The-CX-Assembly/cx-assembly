import { requireSection } from '@/features/auth/session';
import { getAdminSiteContext, sitesWith } from '@/features/sites/admin-site';
import { getAllSpeakersAdmin } from '@/features/speakers/server';
import SpeakersManager from '@/features/speakers/components/SpeakersManager';
import ChooseSite from '@/features/sites/components/ChooseSite';

export default async function AdminSpeakersPage() {
  await requireSection('leaders');
  const { sites, site } = await getAdminSiteContext();

  if (!site?.modules.includes('leaders')) {
    return (
      <ChooseSite
        title="Choose a website"
        message={
          site
            ? `${site.name} doesn’t use CMO Speaker profiles. A super admin can turn them on under Websites, or pick another website:`
            : 'CMO Speakers belong to one website. Pick which one to manage:'
        }
        sites={sitesWith(sites, 'leaders')}
      />
    );
  }

  const speakers = await getAllSpeakersAdmin(site.id);

  // Keyed so switching websites resets the editor.
  return <SpeakersManager key={site.id} siteId={site.id} initialSpeakers={speakers} />;
}
