import { requireSection } from '@/features/auth/session';
import { getAdminSiteContext } from '@/features/sites/admin-site';
import { getAllResourcesAdmin, getAllVideosAdmin, getMediaSettings } from '@/features/media/server';
import { hasAdminCredentials } from '@/server/firebase-admin';
import MediaManager from '@/features/media/components/MediaManager';
import ChooseSite from '@/features/sites/components/ChooseSite';

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
