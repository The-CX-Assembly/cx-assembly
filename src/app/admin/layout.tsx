import Link from 'next/link';
import Image from 'next/image';
import { getAdminSession } from '@/lib/auth-session';
import { logoutAdminAction } from '@/app/actions/auth';
import { redirect } from 'next/navigation';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getAdminSession();

  // If session is null, allow login route, but protect everything else
  // Note: /admin/login handles itself; for child pages we redirect
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F8FAFC', display: 'flex', flexDirection: 'column' }}>
      {session && (
        <header
          style={{
            backgroundColor: 'var(--color-primary)',
            color: '#FFFFFF',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            position: 'sticky',
            top: 0,
            zIndex: 100,
          }}
        >
          <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '64px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '28px' }}>
              <Link href="/admin" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ position: 'relative', width: '32px', height: '32px', borderRadius: '6px', overflow: 'hidden', background: '#FFFFFF' }}>
                  <Image src="/brand/logo.png" alt="Logo" fill sizes="32px" style={{ objectFit: 'contain' }} />
                </div>
                <span style={{ fontWeight: 800, fontSize: '1rem', letterSpacing: '-0.01em' }}>
                  CX ASSEMBLY CMS
                </span>
              </Link>

              <nav style={{ display: 'flex', alignItems: 'center', gap: '6px' }} className="admin-nav">
                <Link href="/admin" className="admin-nav-item">
                  Overview
                </Link>
                <Link href="/admin/leads" className="admin-nav-item">
                  Leads Inbox
                </Link>
                <Link href="/admin/leaders" className="admin-nav-item">
                  Founding Leaders
                </Link>
                <Link href="/admin/voices" className="admin-nav-item">
                  Community Voices
                </Link>
                <Link href="/admin/content" className="admin-nav-item">
                  Edit Content
                </Link>
                <Link href="/admin/settings" className="admin-nav-item">
                  Settings
                </Link>
              </nav>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <Link
                href="/"
                target="_blank"
                style={{
                  fontSize: '0.8125rem',
                  color: 'rgba(255, 255, 255, 0.8)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <span>Live Site</span>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3" />
                </svg>
              </Link>

              <form action={logoutAdminAction}>
                <button
                  type="submit"
                  style={{
                    background: 'rgba(255, 255, 255, 0.12)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    color: '#FFFFFF',
                    padding: '6px 14px',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.8125rem',
                    cursor: 'pointer',
                    fontWeight: 600,
                  }}
                >
                  Logout
                </button>
              </form>
            </div>
          </div>
        </header>
      )}

      <main style={{ flex: 1 }}>{children}</main>
    </div>
  );
}
