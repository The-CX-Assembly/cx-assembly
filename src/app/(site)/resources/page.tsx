import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Navbar from '@/components/site/Navbar';
import Footer from '@/components/site/Footer';
import { Eyebrow } from '@/components/site/Type';
import { getMediaSettings, getPublishedResources } from '@/modules/media/services/media.service';
import ResourceList from '@/modules/media/components/ResourceList';
import { PAGES, pageGraph, pageMetadata } from '@/modules/seo/utils/metadata';
import JsonLd from '@/modules/seo/components/JsonLd';

export const metadata: Metadata = pageMetadata(PAGES.resources);

export const revalidate = 60;

// Only exists once "Resources page" is switched on in the admin (Videos & PDFs → Where they appear).
export default async function ResourcesPage() {
  const [settings, resources] = await Promise.all([getMediaSettings(), getPublishedResources()]);
  if (!settings.resourcesPage) notFound();

  return (
    <>
      <JsonLd data={pageGraph(PAGES.resources)} />
      <Navbar />
      <main>
        <section className="hero">
          <div className="wrap">
            <div className="rise">
              <Eyebrow>Resources</Eyebrow>
            </div>
            <h1 className="display rise-2" style={{ marginTop: 28, maxWidth: '16ch' }}>
              {settings.resourcesTitle}
            </h1>
            {settings.resourcesIntro && (
              <p className="lede rise-3" style={{ marginTop: 40, maxWidth: '52ch' }}>
                {settings.resourcesIntro}
              </p>
            )}
          </div>
        </section>

        <section className="section" style={{ paddingTop: 0 }}>
          <div className="wrap">
            {resources.length ? (
              <ResourceList resources={resources} />
            ) : (
              <p className="lede">New resources are on their way. Check back soon.</p>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
