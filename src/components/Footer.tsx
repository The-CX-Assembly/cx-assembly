import Link from 'next/link';
import Image from 'next/image';

export default function Footer() {
  return (
    <footer className="bg-navy-dark" style={{ borderTop: '1px solid rgba(255, 255, 255, 0.1)', paddingTop: '72px', paddingBottom: '40px' }}>
      <div className="container">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '48px', marginBottom: '56px' }}>
          {/* Brand Col */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <div style={{ position: 'relative', width: '48px', height: '48px', borderRadius: '8px', overflow: 'hidden', background: '#FFFFFF', padding: '2px' }}>
                <Image
                  src="/brand/logo.png"
                  alt="The CX Assembly Logo"
                  fill
                  sizes="48px"
                  style={{ objectFit: 'contain' }}
                />
              </div>
              <div>
                <span style={{ display: 'block', fontSize: '1.25rem', fontWeight: 800, color: '#FFFFFF', letterSpacing: '-0.02em' }}>
                  THE CX ASSEMBLY
                </span>
                <span style={{ display: 'block', fontSize: '0.6875rem', fontWeight: 600, color: 'var(--color-text-inverse-muted)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                  Built by CX Leaders. For CX Leaders.
                </span>
              </div>
            </div>
            <p style={{ color: 'var(--color-text-inverse-muted)', fontSize: '0.9375rem', marginBottom: '20px', lineHeight: 1.6 }}>
              A private, peer-led community bringing together India’s senior customer experience leaders to challenge perspectives, solve real problems and shape what CX needs to become next.
            </p>
            <p style={{ color: 'var(--color-gold)', fontSize: '0.875rem', fontWeight: 600 }}>
              An initiative of The Executive Assembly.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 style={{ color: '#FFFFFF', fontSize: '1rem', fontWeight: 700, marginBottom: '20px', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
              Explore
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px', padding: 0 }}>
              <li>
                <Link href="/#why-we-exist" style={{ color: 'var(--color-text-inverse-muted)', fontSize: '0.9375rem' }} className="footer-link">
                  Why We Exist
                </Link>
              </li>
              <li>
                <Link href="/#for-cx-leaders" style={{ color: 'var(--color-text-inverse-muted)', fontSize: '0.9375rem' }} className="footer-link">
                  For CX Leaders
                </Link>
              </li>
              <li>
                <Link href="/founding-50" style={{ color: 'var(--color-text-inverse-muted)', fontSize: '0.9375rem' }} className="footer-link">
                  The Founding 50 Leaders
                </Link>
              </li>
              <li>
                <Link href="/#for-partners" style={{ color: 'var(--color-text-inverse-muted)', fontSize: '0.9375rem' }} className="footer-link">
                  For Partners
                </Link>
              </li>
              <li>
                <Link href="/community-voices" style={{ color: 'var(--color-text-inverse-muted)', fontSize: '0.9375rem' }} className="footer-link">
                  Community Voices
                </Link>
              </li>
            </ul>
          </div>

          {/* Connect & Community */}
          <div>
            <h4 style={{ color: '#FFFFFF', fontSize: '1rem', fontWeight: 700, marginBottom: '20px', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
              Community & Engagement
            </h4>
            <p style={{ color: 'var(--color-text-inverse-muted)', fontSize: '0.9375rem', marginBottom: '16px', lineHeight: 1.6 }}>
              Connect with fellow leaders or follow community updates on LinkedIn.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '24px' }}>
              <a
                href="https://www.linkedin.com/company/the-cx-assembly"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="The CX Assembly on LinkedIn"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '42px',
                  height: '42px',
                  borderRadius: '8px',
                  background: 'rgba(255, 255, 255, 0.08)',
                  color: '#FFFFFF',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  transition: 'all 0.2s ease',
                }}
                className="social-btn"
              >
                <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                </svg>
              </a>
            </div>
            <Link href="/#join" className="btn btn-outline-white" style={{ padding: '8px 16px', fontSize: '0.875rem' }}>
              Apply For Membership
            </Link>
          </div>
        </div>

        {/* Bottom Bar */}
        <div
          style={{
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            paddingTop: '32px',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px',
            color: 'var(--color-text-inverse-muted)',
            fontSize: '0.875rem',
          }}
        >
          <div>
            © 2026 The CX Assembly. All rights reserved.
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            <Link href="/privacy-policy" className="footer-link">
              Privacy Policy
            </Link>
            <Link href="/#join" className="footer-link">
              Contact
            </Link>
            <Link href="/admin/login" style={{ color: 'rgba(255, 255, 255, 0.4)', fontSize: '0.8125rem' }} className="footer-link">
              Admin Portal
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
