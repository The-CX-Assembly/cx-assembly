import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { getVoices } from '@/lib/content';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Community Voices | The CX Assembly',
  description:
    'Unfiltered perspectives, lessons, and candid reflections from senior customer experience heads across India.',
};

export const revalidate = 60;

export default async function CommunityVoicesPage() {
  const voices = await getVoices();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />

      <main style={{ flex: 1 }}>
        <section className="bg-navy-dark" style={{ paddingTop: '80px', paddingBottom: '80px', textAlign: 'center' }}>
          <div className="container">
            <span className="badge-pill badge-gold" style={{ marginBottom: '16px' }}>
              Unfiltered Perspectives
            </span>
            <h1 style={{ fontSize: 'clamp(2.5rem, 5vw, 3.5rem)', fontWeight: 800, color: '#FFFFFF', marginBottom: '16px' }}>
              Community Voices
            </h1>
            <p style={{ maxWidth: '720px', margin: '0 auto', fontSize: '1.125rem', color: 'rgba(255, 255, 255, 0.85)', lineHeight: 1.6 }}>
              Real questions, honest reflections, and collective learning from the leaders shaping modern customer journeys in India.
            </p>
          </div>
        </section>

        <section className="section-pad bg-warm-section">
          <div className="container">
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                gap: '32px',
              }}
            >
              {voices.map((voice) => (
                <div
                  key={voice.id}
                  style={{
                    background: '#FFFFFF',
                    borderRadius: 'var(--radius-xl)',
                    padding: '40px 32px',
                    boxShadow: 'var(--shadow-md)',
                    border: '1px solid #E2E8F0',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                  }}
                >
                  <div style={{ marginBottom: '24px' }}>
                    <svg width="32" height="32" fill="var(--color-accent-soft)" viewBox="0 0 24 24" style={{ marginBottom: '16px' }}>
                      <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z"/>
                    </svg>
                    <p style={{ fontSize: '1.0625rem', color: 'var(--color-text-body)', lineHeight: 1.7, fontStyle: 'italic' }}>
                      “{voice.quote}”
                    </p>
                  </div>

                  <div style={{ borderTop: '1px solid #F1F5F9', paddingTop: '20px' }}>
                    <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--color-primary)' }}>
                      {voice.name}
                    </h3>
                    <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-accent)' }}>
                      {voice.designation}
                    </p>
                    <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
                      {voice.company}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
