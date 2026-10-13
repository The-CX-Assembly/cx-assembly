'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="glass-nav">
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '80px' }}>
        {/* Logo */}
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none' }}>
          <div style={{ position: 'relative', width: '52px', height: '52px', borderRadius: '8px', overflow: 'hidden' }}>
            <Image
              src="/brand/logo.png"
              alt="The CX Assembly Logo"
              fill
              sizes="52px"
              style={{ objectFit: 'contain' }}
              priority
            />
          </div>
          <div>
            <span style={{ display: 'block', fontSize: '1.1875rem', fontWeight: 800, color: 'var(--color-primary)', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
              THE CX ASSEMBLY
            </span>
            <span style={{ display: 'block', fontSize: '0.6875rem', fontWeight: 600, color: 'var(--color-text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              Built By CX Leaders
            </span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav style={{ display: 'none', alignItems: 'center', gap: '28px' }} className="desktop-menu">
          <Link href="/#why-we-exist" className="nav-link">
            Why We Exist
          </Link>
          <Link href="/#for-cx-leaders" className="nav-link">
            For CX Leaders
          </Link>
          <Link href="/founding-50" className="nav-link">
            Founding 50
          </Link>
          <Link href="/#for-partners" className="nav-link">
            For Partners
          </Link>
          <Link href="/community-voices" className="nav-link">
            Community Voices
          </Link>
          <Link href="/#join" className="nav-link">
            Contact Us
          </Link>
        </nav>

        {/* CTA Button */}
        <div style={{ display: 'none', alignItems: 'center', gap: '16px' }} className="desktop-cta">
          <Link href="/#join" className="btn btn-primary" style={{ padding: '10px 20px', fontSize: '0.875rem' }}>
            Join The Assembly
          </Link>
        </div>

        {/* Mobile Hamburger Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle navigation menu"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '42px',
            height: '42px',
            background: 'transparent',
            border: '1px solid rgba(12, 35, 57, 0.15)',
            borderRadius: 'var(--radius-sm)',
            cursor: 'pointer',
            color: 'var(--color-primary)',
          }}
          className="mobile-toggle"
        >
          {mobileMenuOpen ? (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          ) : (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
          )}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div
          style={{
            position: 'fixed',
            top: '80px',
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(255, 255, 255, 0.98)',
            backdropFilter: 'blur(16px)',
            padding: '32px 24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
            zIndex: 99,
            overflowY: 'auto',
          }}
          className="mobile-drawer"
        >
          <Link href="/#why-we-exist" onClick={() => setMobileMenuOpen(false)} style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--color-primary)' }}>
            Why We Exist
          </Link>
          <Link href="/#for-cx-leaders" onClick={() => setMobileMenuOpen(false)} style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--color-primary)' }}>
            For CX Leaders
          </Link>
          <Link href="/founding-50" onClick={() => setMobileMenuOpen(false)} style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--color-primary)' }}>
            Founding 50
          </Link>
          <Link href="/#for-partners" onClick={() => setMobileMenuOpen(false)} style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--color-primary)' }}>
            For Partners
          </Link>
          <Link href="/community-voices" onClick={() => setMobileMenuOpen(false)} style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--color-primary)' }}>
            Community Voices
          </Link>
          <Link href="/#join" onClick={() => setMobileMenuOpen(false)} style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--color-primary)' }}>
            Contact Us
          </Link>
          <div style={{ paddingTop: '20px', borderTop: '1px solid #E2E8F0' }}>
            <Link
              href="/#join"
              onClick={() => setMobileMenuOpen(false)}
              className="btn btn-primary"
              style={{ width: '100%', textAlign: 'center' }}
            >
              Join The Assembly
            </Link>
          </div>
        </div>
      )}

      <style jsx>{`
        .nav-link {
          font-size: 0.9375rem;
          font-weight: 500;
          color: var(--color-text-body);
          padding: 8px 0;
          position: relative;
        }
        .nav-link:hover {
          color: var(--color-primary);
        }
        .nav-link:after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          width: 0%;
          height: 2px;
          background: var(--color-primary);
          transition: width 0.2s ease;
        }
        .nav-link:hover:after {
          width: 100%;
        }
        @media (min-width: 992px) {
          .desktop-menu {
            display: flex !important;
          }
          .desktop-cta {
            display: flex !important;
          }
          .mobile-toggle {
            display: none !important;
          }
          .mobile-drawer {
            display: none !important;
          }
        }
      `}</style>
    </header>
  );
}
