import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import LeaderCard from '@/components/LeaderCard';
import { getSiteContent, getLeaders } from '@/lib/content';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'The Founding 50 Leaders | The CX Assembly',
  description:
    'Meet the 50 founding customer experience leaders shaping India’s peer-led CX community.',
};

export const revalidate = 60;

export default async function Founding50Page() {
  const content = await getSiteContent();
  const leaders = await getLeaders();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />

      <main style={{ flex: 1 }}>
        {/* Header Hero */}
        <section
          className="bg-navy-dark"
          style={{
            paddingTop: '80px',
            paddingBottom: '80px',
            textAlign: 'center',
            position: 'relative',
          }}
        >
          <div className="container">
            <span className="badge-pill badge-gold" style={{ marginBottom: '16px' }}>
              {content.founding50.headline}
            </span>
            <h1
              style={{
                fontSize: 'clamp(2.5rem, 5vw, 3.75rem)',
                fontWeight: 800,
                color: '#FFFFFF',
                lineHeight: 1.15,
                marginBottom: '16px',
              }}
            >
              {content.founding50.subheadline}
            </h1>
            <p
              style={{
                fontSize: '1.25rem',
                fontWeight: 600,
                color: 'var(--color-gold)',
                marginBottom: '24px',
              }}
            >
              {content.founding50.leadParagraph}
            </p>
            <p
              style={{
                maxWidth: '780px',
                margin: '0 auto',
                fontSize: '1.0625rem',
                color: 'rgba(255, 255, 255, 0.85)',
                lineHeight: 1.7,
              }}
            >
              {content.founding50.description}
            </p>
          </div>
        </section>

        {/* Leaders Grid */}
        <section className="section-pad bg-warm-section">
          <div className="container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px', flexWrap: 'wrap', gap: '16px' }}>
              <div>
                <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--color-primary)' }}>
                  Meet the Founding CX Leaders
                </h2>
                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9375rem' }}>
                  Showing {leaders.length} Founding Leaders
                </p>
              </div>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                gap: '28px',
              }}
            >
              {leaders.map((leader) => (
                <LeaderCard key={leader.id} leader={leader} />
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
