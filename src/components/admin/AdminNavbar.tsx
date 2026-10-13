'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { logoutAdminAction } from '@/app/actions/auth';

interface AdminNavbarProps {
  userEmail: string;
}

const navLinks = [
  { label: 'Overview', href: '/admin' },
  { label: 'Leads Inbox', href: '/admin/leads' },
  { label: 'Founding Leaders', href: '/admin/leaders' },
  { label: 'Community Voices', href: '/admin/voices' },
  { label: 'Content Editor', href: '/admin/content' },
  { label: 'Settings', href: '/admin/settings' },
];

export default function AdminNavbar({ userEmail }: AdminNavbarProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (href: string) => {
    if (href === '/admin') {
      return pathname === '/admin';
    }
    return pathname.startsWith(href);
  };

  const initial = userEmail ? userEmail.charAt(0).toUpperCase() : 'A';
  const username = userEmail ? userEmail.split('@')[0] : 'Admin';

  return (
    <header
      style={{
        backgroundColor: '#0C2339',
        color: '#FFFFFF',
        borderBottom: '1px solid rgba(255, 255, 255, 0.12)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        backdropFilter: 'blur(12px)',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
      }}
    >
      <div
        className="container"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: '68px',
        }}
      >
        {/* Brand & Left Navigation */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
          <Link
            href="/admin"
            style={{ display: 'flex', alignItems: 'center', gap: '12px' }}
            title="The CX Assembly Admin Dashboard"
          >
            <div
              style={{
                position: 'relative',
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                overflow: 'hidden',
                background: '#FFFFFF',
                boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                padding: '2px',
              }}
            >
              <Image
                src="/brand/logo.png"
                alt="Logo"
                fill
                sizes="36px"
                style={{ objectFit: 'contain' }}
              />
            </div>
            <div>
              <span
                style={{
                  fontWeight: 800,
                  fontSize: '0.9375rem',
                  letterSpacing: '0.04em',
                  display: 'block',
                  lineHeight: 1.2,
                  color: '#FFFFFF',
                }}
              >
                THE CX ASSEMBLY
              </span>
              <span
                style={{
                  fontSize: '0.6875rem',
                  fontWeight: 700,
                  letterSpacing: '0.08em',
                  color: 'var(--color-gold)',
                  textTransform: 'uppercase',
                }}
              >
                Executive CMS
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav
            style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
            className="admin-desktop-nav"
          >
            {navLinks.map((link) => {
              const active = isActive(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  style={{
                    padding: '8px 14px',
                    borderRadius: '8px',
                    fontSize: '0.875rem',
                    fontWeight: active ? 700 : 500,
                    color: active ? '#FFFFFF' : 'rgba(255, 255, 255, 0.72)',
                    backgroundColor: active
                      ? 'rgba(255, 255, 255, 0.14)'
                      : 'transparent',
                    border: active
                      ? '1px solid rgba(255, 255, 255, 0.2)'
                      : '1px solid transparent',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                  onMouseEnter={(e) => {
                    if (!active) {
                      e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)';
                      e.currentTarget.style.color = '#FFFFFF';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!active) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.color = 'rgba(255, 255, 255, 0.72)';
                    }
                  }}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right Tools & User Info */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {/* Live Site Preview Link */}
          <Link
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              fontSize: '0.8125rem',
              color: 'rgba(255, 255, 255, 0.85)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              borderRadius: '6px',
              backgroundColor: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.16)';
              e.currentTarget.style.color = '#FFFFFF';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)';
              e.currentTarget.style.color = 'rgba(255, 255, 255, 0.85)';
            }}
          >
            <span>Live Site</span>
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3" />
            </svg>
          </Link>

          {/* User Profile Pill */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '4px 10px 4px 6px',
              borderRadius: '9999px',
              backgroundColor: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
            }}
            className="admin-user-pill"
          >
            <div
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--color-gold), #9A7416)',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: '0.75rem',
                boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
              }}
            >
              {initial}
            </div>
            <div style={{ lineHeight: 1.1 }}>
              <span
                style={{
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  display: 'block',
                  color: '#FFFFFF',
                  maxWidth: '140px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
                title={userEmail}
              >
                {username}
              </span>
              <span
                style={{
                  fontSize: '0.625rem',
                  color: 'var(--color-gold)',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                }}
              >
                Super Admin
              </span>
            </div>
          </div>

          {/* Logout Action */}
          <form action={logoutAdminAction}>
            <button
              type="submit"
              style={{
                background: 'rgba(239, 68, 68, 0.12)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                color: '#FCA5A5',
                padding: '6px 14px',
                borderRadius: '6px',
                fontSize: '0.8125rem',
                cursor: 'pointer',
                fontWeight: 600,
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(239, 68, 68, 0.25)';
                e.currentTarget.style.color = '#FFFFFF';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(239, 68, 68, 0.12)';
                e.currentTarget.style.color = '#FCA5A5';
              }}
            >
              Logout
            </button>
          </form>

          {/* Mobile Menu Toggle Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle Navigation Menu"
            style={{
              background: 'transparent',
              border: 'none',
              color: '#FFFFFF',
              cursor: 'pointer',
              padding: '6px',
              display: 'none',
            }}
            className="admin-mobile-toggle"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              {mobileMenuOpen ? (
                <path d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div
          style={{
            backgroundColor: '#061524',
            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
            padding: '16px 24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
          }}
          className="admin-mobile-menu"
        >
          {navLinks.map((link) => {
            const active = isActive(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                style={{
                  padding: '10px 14px',
                  borderRadius: '6px',
                  fontSize: '0.9375rem',
                  fontWeight: active ? 700 : 500,
                  color: active ? '#FFFFFF' : 'rgba(255, 255, 255, 0.75)',
                  backgroundColor: active
                    ? 'rgba(255, 255, 255, 0.12)'
                    : 'transparent',
                }}
              >
                {link.label}
              </Link>
            );
          })}
        </div>
      )}
    </header>
  );
}
