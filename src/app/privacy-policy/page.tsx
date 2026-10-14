import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Eyebrow } from '@/components/Type';
import { getSiteContent } from '@/lib/content';
import { Metadata } from 'next';
import { pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({
  title: 'Privacy Policy',
  description: 'Privacy Policy and data protection terms for The CX Assembly.',
  path: '/privacy-policy',
});

export const revalidate = 60;

/** Renders **bold** spans inside a line. */
function inline(text: string) {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
    part.startsWith('**') && part.endsWith('**') ? (
      <strong key={i} style={{ color: 'var(--navy)', fontWeight: 600 }}>
        {part.slice(2, -2)}
      </strong>
    ) : (
      part
    )
  );
}

/** Minimal renderer for the markdown-like policy text stored in the CMS. */
function renderPolicy(source: string) {
  const blocks: React.ReactNode[] = [];
  let list: string[] = [];

  const flushList = () => {
    if (list.length) {
      blocks.push(
        <ul key={`ul-${blocks.length}`} style={{ paddingLeft: '1.1em', display: 'grid', gap: 10 }}>
          {list.map((li) => (
            <li key={li}>{inline(li)}</li>
          ))}
        </ul>
      );
      list = [];
    }
  };

  for (const raw of source.split('\n')) {
    const line = raw.trim();
    if (line.startsWith('- ')) {
      list.push(line.slice(2));
      continue;
    }
    flushList();
    if (!line || /^#{1,3}\s/.test(line)) continue; // page already has its own title
    if (line.startsWith('#')) {
      blocks.push(
        <h2 key={`h-${blocks.length}`} className="h-md" style={{ marginTop: '1.6em' }}>
          {line.replace(/^#+\s*/, '')}
        </h2>
      );
    } else {
      blocks.push(<p key={`p-${blocks.length}`}>{inline(line)}</p>);
    }
  }
  flushList();
  return blocks;
}

export default async function PrivacyPolicyPage() {
  const content = await getSiteContent();

  return (
    <>
      <Navbar />

      <main>
        <section className="hero">
          <div className="wrap">
            <Eyebrow>Legal</Eyebrow>
            <h1 className="display" style={{ marginTop: 28 }}>
              Privacy <span className="soft">Policy</span>
            </h1>
          </div>
        </section>

        <section className="section" style={{ paddingTop: 0 }}>
          <div className="wrap split">
            <div className="split__aside">
              <p className="muted" style={{ fontSize: '0.9375rem', paddingTop: 32 }}>
                Last updated
                <br />
                October 2026
              </p>
            </div>
            <div className="split__main prose" style={{ borderTop: '1px solid var(--rule)', paddingTop: 32, maxWidth: '72ch' }}>
              {renderPolicy(content.privacyPolicy)}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
