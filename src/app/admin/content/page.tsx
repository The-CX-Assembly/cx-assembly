import { requireSection } from '@/lib/auth-session';
import { getAdminSiteContext } from '@/lib/admin-site';
import { getContentSections, getSiteContent } from '@/lib/content';
import ContentEditor from '@/components/admin/ContentEditor';
import SectionsEditor from '@/components/admin/SectionsEditor';
import ChooseSite from '@/components/admin/ChooseSite';

export default async function AdminContentPage() {
  await requireSection('content');
  const { sites, site } = await getAdminSiteContext();

  if (!site) {
    return <ChooseSite title="Choose a website" message="Content belongs to one website. Pick which one to edit:" sites={sites} />;
  }

  return (
    <div className="container" style={{ paddingTop: '40px', paddingBottom: '60px' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '1.875rem', fontWeight: 800, color: 'var(--color-primary)', marginBottom: '6px' }}>
          Edit {site.name} Copy & Sections
        </h1>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9375rem' }}>
          {site.builtIn
            ? 'Modify any text section on the website. Submitting saves directly to Firestore and refreshes the live pages immediately.'
            : `Sections and fields here are served to ${site.name} by the content API as content.<section>.<field>.`}
        </p>
      </div>

      {site.builtIn ? (
        <ContentEditor initialContent={await getSiteContent()} />
      ) : (
        <SectionsEditor key={site.id} siteId={site.id} siteName={site.name} initialContent={await getContentSections(site.id)} />
      )}
    </div>
  );
}
