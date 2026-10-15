import { requireSection } from '@/features/auth/session';
import { getAdminSiteContext } from '@/features/sites/admin-site';
import { getContentSections, getSiteContent } from '@/features/content/server';
import ContentEditor from '@/features/content/components/ContentEditor';
import SectionsEditor from '@/features/content/components/SectionsEditor';
import ChooseSite from '@/features/sites/components/ChooseSite';
import { PageHeader } from '@/components/admin/ui';
import { IconEdit } from '@/components/admin/AdminIcons';
import ui from '@/components/admin/ui.module.css';

export default async function AdminContentPage() {
  await requireSection('content');
  const { sites, site } = await getAdminSiteContext();

  if (!site) {
    return <ChooseSite title="Choose a website" message="Content belongs to one website. Pick which one to edit:" sites={sites} />;
  }

  return (
    <div className={ui.page}>
      <PageHeader
        eyebrow={site.name}
        icon={<IconEdit size={14} />}
        title="Content"
        description={
          site.builtIn
            ? 'The words on every section of the website. Saving updates the live pages within a minute.'
            : `Sections and fields served to ${site.name} by the content API as content.<section>.<field>.`
        }
      />
      {site.builtIn ? (
        <ContentEditor initialContent={await getSiteContent()} />
      ) : (
        <SectionsEditor key={site.id} siteId={site.id} siteName={site.name} initialContent={await getContentSections(site.id)} />
      )}
    </div>
  );
}
