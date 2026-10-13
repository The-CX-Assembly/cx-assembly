import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { getSiteContent } from '@/lib/content';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy | The CX Assembly',
  description: 'Privacy Policy and data protection terms for The CX Assembly.',
};

export const revalidate = 60;

export default async function PrivacyPolicyPage() {
  const content = await getSiteContent();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />

      <main style={{ flex: 1, backgroundColor: 'var(--color-bg-warm)' }}>
        <div className="container" style={{ paddingTop: '64px', paddingBottom: '96px' }}>
          <div
            style={{
              maxWidth: '800px',
              margin: '0 auto',
              background: '#FFFFFF',
              borderRadius: 'var(--radius-xl)',
              padding: '48px',
              boxShadow: 'var(--shadow-md)',
              border: '1px solid #E2E8F0',
            }}
          >
            <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--color-primary)', marginBottom: '8px' }}>
              Privacy Policy
            </h1>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', marginBottom: '32px' }}>
              Last updated: October 2026
            </p>

            <div
              style={{
                fontSize: '1rem',
                lineHeight: 1.8,
                color: 'var(--color-text-body)',
                whiteSpace: 'pre-line',
              }}
            >
              {content.privacyPolicy}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
