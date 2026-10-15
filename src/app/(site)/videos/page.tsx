import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Navbar from '@/components/site/Navbar';
import Footer from '@/components/site/Footer';
import { Eyebrow } from '@/components/site/Type';
import { getMediaSettings, getPublishedVideos } from '@/features/media/server';
import VideoGrid from '@/features/media/components/VideoGrid';
import { PAGES, pageGraph, pageMetadata } from '@/features/seo/metadata';
import JsonLd from '@/features/seo/components/JsonLd';

export const metadata: Metadata = pageMetadata(PAGES.videos);

export const revalidate = 60;

// Only exists once "Videos page" is switched on in the admin (Videos & PDFs → Where they appear).
export default async function VideosPage() {
  const [settings, videos] = await Promise.all([getMediaSettings(), getPublishedVideos()]);
  if (!settings.videosPage) notFound();

  return (
    <>
      <JsonLd data={pageGraph(PAGES.videos)} />
      <Navbar />
      <main>
        <section className="hero">
          <div className="wrap">
            <div className="rise">
              <Eyebrow>Watch</Eyebrow>
            </div>
            <h1 className="display rise-2" style={{ marginTop: 28, maxWidth: '16ch' }}>
              {settings.videosTitle}
            </h1>
            {settings.videosIntro && (
              <p className="lede rise-3" style={{ marginTop: 40, maxWidth: '52ch' }}>
                {settings.videosIntro}
              </p>
            )}
          </div>
        </section>

        <section className="section" style={{ paddingTop: 0 }}>
          <div className="wrap">
            {videos.length ? (
              <VideoGrid videos={videos} />
            ) : (
              <p className="lede">New videos are on their way. Check back soon.</p>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
