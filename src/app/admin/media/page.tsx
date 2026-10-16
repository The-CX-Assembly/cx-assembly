import { requireSection } from '@/middlewares/auth.middleware';
import { getAdminSiteContext } from '@/modules/sites/services/admin-site.service';
import { getAllResourcesAdmin, getAllVideosAdmin, getMediaSettings } from '@/modules/media/services/media.service';
import { hasAdminCredentials } from '@/config/firebase-admin';
import MediaManager from '@/modules/media/components/MediaManager';
import ChooseSite from '@/modules/sites/components/ChooseSite';

export default async function AdminMediaPage() {
  await requireSection('media');
  const { sites, site } = await getAdminSiteContext();

  if (!site) {
    return <ChooseSite title="Choose a website" message="Videos and PDFs belong to one website. Pick which one to manage:" sites={sites} />;
  }

  const [videos, resources, settings] = await Promise.all([
    getAllVideosAdmin(site.id),
    getAllResourcesAdmin(site.id),
    getMediaSettings(site.id),
  ]);

  return (
    // Keyed so switching websites resets the editor.
    <MediaManager
      key={site.id}
      siteId={site.id}
      siteUrl={site.url}
      initialVideos={videos}
      initialResources={resources}
      initialSettings={settings}
      canWrite={hasAdminCredentials()}
    />
  );
}
