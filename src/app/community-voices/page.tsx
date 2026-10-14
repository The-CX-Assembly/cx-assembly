import Navbar from '@/components/Navbar';
import { JoinButton } from '@/components/JoinModal';
import Footer from '@/components/Footer';
import { Eyebrow } from '@/components/Type';
import { ArrowRight } from '@/components/Icons';
import { getVoices } from '@/lib/content';
import { Metadata } from 'next';
import { PAGES, pageGraph, pageMetadata } from '@/lib/seo';
import JsonLd from '@/components/JsonLd';

export const metadata: Metadata = pageMetadata(PAGES.communityVoices);

export const revalidate = 60;

export default async function CommunityVoicesPage() {
  const voices = await getVoices();

  return (
    <>
      <JsonLd data={pageGraph(PAGES.communityVoices)} />
      <Navbar />

      <main>
        <section className="hero">
          <div className="wrap">
            <div className="rise">
              <Eyebrow>Community Voices</Eyebrow>
            </div>
            <h1 className="display rise-2" style={{ marginTop: 28, maxWidth: '13ch' }}>
              Real Questions. <span className="soft">Honest Answers.</span>
            </h1>
            <p className="lede rise-3" style={{ marginTop: 40, maxWidth: '52ch' }}>
              Reflections and lessons from the leaders shaping customer experience in India.
            </p>
          </div>
        </section>

        <section className="section" style={{ paddingTop: 0 }}>
          <div className="wrap">
            <ul className="quotes">
              {voices.map((voice) => (
                <li key={voice.id} className="quote reveal">
                  <span className="quote__mark" aria-hidden="true">
                    &ldquo;
                  </span>
                  <blockquote className="quote__text">{voice.quote}</blockquote>
                  <p className="quote__by">
                    <strong>{voice.name}</strong>
                    {voice.designation}, {voice.company}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="section" style={{ paddingTop: 0 }}>
          <div className="wrap section-head" style={{ marginBottom: 0 }}>
            <h2 className="h-xl" style={{ maxWidth: '16ch' }}>
              Add your voice <span className="soft">to the conversation.</span>
            </h2>
            <JoinButton source="community-voices">
              Join The Assembly
              <ArrowRight size={16} />
            </JoinButton>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
