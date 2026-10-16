import { requireSection } from '@/middlewares/auth.middleware';
import { getAdminSiteContext } from '@/modules/sites/services/admin-site.service';
import { getContentSections, getSiteContent } from '@/modules/content/services/content.service';
import ContentEditor from '@/modules/content/components/ContentEditor';
import SectionsEditor from '@/modules/content/components/SectionsEditor';
import ChooseSite from '@/modules/sites/components/ChooseSite';
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
