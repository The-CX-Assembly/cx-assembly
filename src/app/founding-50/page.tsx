import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import LeaderCard from '@/components/LeaderCard';
import { Accent, Eyebrow } from '@/components/Type';
import { getSiteContent, getLeaders } from '@/lib/content';
import { Metadata } from 'next';
import { PAGES, pageGraph, pageMetadata } from '@/lib/seo';
import JsonLd from '@/components/JsonLd';

export const metadata: Metadata = pageMetadata(PAGES.founding50);

export const revalidate = 60;

export default async function Founding50Page() {
  const content = await getSiteContent();
  const leaders = await getLeaders();
  const { founding50 } = content;
  const paragraphs = founding50.description.split(/\n\s*\n/).filter(Boolean);

  return (
    <>
      <JsonLd data={pageGraph(PAGES.founding50)} />
      <Navbar />

      <main>
        <section className="hero">
          <div className="wrap">
            <div className="rise">
              <Eyebrow>{founding50.headline}</Eyebrow>
            </div>
            <h1 className="display rise-2" style={{ marginTop: 28, maxWidth: '14ch' }}>
              <Accent text={founding50.subheadline} />
            </h1>

            <div className="split rise-3" style={{ marginTop: 'clamp(48px, 7vw, 96px)' }}>
              <p className="split__l5 h-lg">{founding50.leadParagraph}</p>
              <div className="split__r6 prose">
                {paragraphs.map((p) => (
                  <p key={p.slice(0, 32)}>{p}</p>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="section" style={{ paddingTop: 0 }}>
          <div className="wrap">
            <div className="section-head" style={{ paddingTop: 32, borderTop: '1px solid var(--rule)' }}>
              <h2 className="h-md">Meet the Founding CX Leaders</h2>
              <p className="muted" style={{ fontVariantNumeric: 'tabular-nums' }}>
                {String(leaders.length).padStart(2, '0')} / 50
              </p>
            </div>

            <div className="people">
              {leaders.map((leader) => (
                <LeaderCard key={leader.id} leader={leader} />
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
