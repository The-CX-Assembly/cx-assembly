import Link from 'next/link';
import Image from 'next/image';
import { redirect } from 'next/navigation';
import { getAdminSession } from '@/lib/auth-session';
import { getAdminDb } from '@/lib/firebase-admin';
import { getLeaders, getVoices } from '@/lib/content';
import { Lead } from '@/types';
import RecentLeadsTable from '@/components/admin/RecentLeadsTable';

export default async function AdminDashboardPage() {
  const session = await getAdminSession();
  if (!session) {
    redirect('/admin/login');
  }

  const db = getAdminDb();
  const leads: Lead[] = [];
  if (db) {
    try {
      const snap = await db.collection('leads').orderBy('createdAt', 'desc').limit(25).get();
      snap.forEach((doc) => {
        leads.push({ id: doc.id, ...(doc.data() as Omit<Lead, 'id'>) });
      });
    } catch (e) {
      console.warn('Could not load leads for dashboard:', e);
    }
  }

  const leaders = await getLeaders();
  const voices = await getVoices();

  // Metrics calculations
  const totalLeads = leads.length;
  const newLeadsCount = leads.filter((l) => l.status === 'new').length;
  const reviewedCount = leads.filter((l) => l.status === 'reviewed').length;
  const approvedCount = leads.filter((l) => l.status === 'approved').length;
  const rejectedCount = leads.filter((l) => l.status === 'rejected').length;

  const cxLeadsCount = leads.filter((l) => l.type === 'cx_leader').length;
  const partnerLeadsCount = leads.filter((l) => l.type === 'partner').length;

  const foundingTarget = 50;
  const foundingProgress = Math.min(Math.round((leaders.length / foundingTarget) * 100), 100);

  const username = session.email ? session.email.split('@')[0] : 'Administrator';

  return (
    <div className="container" style={{ paddingTop: '36px', paddingBottom: '64px' }}>
      {/* Executive Welcome & System Status Bar */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '20px',
          marginBottom: '32px',
          paddingBottom: '24px',
          borderBottom: '1px solid #E2E8F0',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                color: 'var(--color-gold)',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <span className="pulse-dot" />
              SYSTEM OPERATIONAL • FIREBASE LIVE
            </span>
          </div>
          <h1
            style={{
              fontSize: '1.875rem',
              fontWeight: 800,
              color: 'var(--color-primary)',
              letterSpacing: '-0.02em',
            }}
          >
            Welcome back, {username}
          </h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9375rem', marginTop: '2px' }}>
            Executive Control Portal & Content Management System for The CX Assembly.
          </p>
        </div>

        {/* Header Action Shortcuts */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <Link
            href="/admin/leads"
            className="btn btn-outline-navy"
            style={{ fontSize: '0.8125rem', padding: '9px 16px', borderRadius: '8px' }}
          >
            Review Inbox ({newLeadsCount})
          </Link>
          <Link
            href="/admin/leaders"
            className="btn btn-primary"
            style={{ fontSize: '0.8125rem', padding: '9px 16px', borderRadius: '8px' }}
          >
            + Add Founding Leader
          </Link>
        </div>
      </div>

      {/* Primary KPI Metrics Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '20px',
          marginBottom: '32px',
        }}
      >
        {/* KPI 1: Inquiries & Applications */}
        <div className="admin-card" style={{ padding: '24px', position: 'relative' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <span
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  color: 'var(--color-text-muted)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}
              >
                Applications & Leads
              </span>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', marginTop: '8px' }}>
                <span
                  style={{
                    fontSize: '2.25rem',
                    fontWeight: 800,
                    color: 'var(--color-primary)',
                    lineHeight: 1,
                  }}
                >
                  {totalLeads}
                </span>
                {newLeadsCount > 0 && (
                  <span
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      backgroundColor: '#EFF6FF',
                      color: '#2563EB',
                      padding: '3px 8px',
                      borderRadius: '9999px',
                      border: '1px solid #BFDBFE',
                    }}
                  >
                    {newLeadsCount} New
                  </span>
                )}
              </div>
            </div>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '10px',
                backgroundColor: 'rgba(44, 122, 171, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--color-accent)',
              }}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
            </div>
          </div>

          <div
            style={{
              marginTop: '16px',
              paddingTop: '12px',
              borderTop: '1px solid #F1F5F9',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
              {cxLeadsCount} CX Leaders • {partnerLeadsCount} Partners
            </span>
            <Link
              href="/admin/leads"
              style={{
                fontSize: '0.8125rem',
                fontWeight: 700,
                color: 'var(--color-accent)',
              }}
            >
              Open Inbox →
            </Link>
          </div>
        </div>

        {/* KPI 2: Founding 50 Cohort Capacity */}
        <div className="admin-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <span
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  color: 'var(--color-text-muted)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}
              >
                Founding 50 Cohort
              </span>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginTop: '8px' }}>
                <span
                  style={{
                    fontSize: '2.25rem',
                    fontWeight: 800,
                    color: '#9A7416',
                    lineHeight: 1,
                  }}
                >
                  {leaders.length}
                </span>
                <span style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>
                  / {foundingTarget} leaders
                </span>
              </div>
            </div>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '10px',
                backgroundColor: 'rgba(197, 155, 39, 0.12)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--color-gold)',
              }}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
            </div>
          </div>

          {/* Progress bar */}
          <div style={{ marginTop: '14px' }}>
            <div
              style={{
                height: '6px',
                backgroundColor: '#F1F5F9',
                borderRadius: '9999px',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  height: '100%',
                  width: `${foundingProgress}%`,
                  background: 'linear-gradient(90deg, var(--color-gold), #F59E0B)',
                  borderRadius: '9999px',
                  transition: 'width 0.5s ease',
                }}
              />
            </div>
          </div>

          <div
            style={{
              marginTop: '12px',
              paddingTop: '8px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
              {foundingTarget - leaders.length} spots remaining
            </span>
            <Link
              href="/admin/leaders"
              style={{
                fontSize: '0.8125rem',
                fontWeight: 700,
                color: 'var(--color-accent)',
              }}
            >
              Manage Roster →
            </Link>
          </div>
        </div>

        {/* KPI 3: Community Voices Testimonials */}
        <div className="admin-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <span
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  color: 'var(--color-text-muted)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}
              >
                Community Voices
              </span>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', marginTop: '8px' }}>
                <span
                  style={{
                    fontSize: '2.25rem',
                    fontWeight: 800,
                    color: 'var(--color-primary)',
                    lineHeight: 1,
                  }}
                >
                  {voices.length}
                </span>
                <span
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    backgroundColor: '#ECFDF5',
                    color: '#047857',
                    padding: '3px 8px',
                    borderRadius: '9999px',
                    border: '1px solid #A7F3D0',
                  }}
                >
                  Live on site
                </span>
              </div>
            </div>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '10px',
                backgroundColor: 'rgba(99, 102, 241, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#6366F1',
              }}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            </div>
          </div>

          <div
            style={{
              marginTop: '16px',
              paddingTop: '12px',
              borderTop: '1px solid #F1F5F9',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
              Verified leader quotes & insights
            </span>
            <Link
              href="/admin/voices"
              style={{
                fontSize: '0.8125rem',
                fontWeight: 700,
                color: 'var(--color-accent)',
              }}
            >
              Edit Quotes →
            </Link>
          </div>
        </div>

        {/* KPI 4: Dynamic CMS Status */}
        <div className="admin-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <span
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  color: 'var(--color-text-muted)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}
              >
                Website CMS Sections
              </span>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginTop: '8px' }}>
                <span
                  style={{
                    fontSize: '2.25rem',
                    fontWeight: 800,
                    color: 'var(--color-primary)',
                    lineHeight: 1,
                  }}
                >
                  7 / 7
                </span>
                <span style={{ fontSize: '0.8125rem', color: '#047857', fontWeight: 700 }}>
                  Active
                </span>
              </div>
            </div>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '10px',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#10B981',
              }}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="2" y1="12" x2="22" y2="12" />
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
              </svg>
            </div>
          </div>

          <div
            style={{
              marginTop: '16px',
              paddingTop: '12px',
              borderTop: '1px solid #F1F5F9',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
              Hero, Why Us, Pillars, About & more
            </span>
            <Link
              href="/admin/content"
              style={{
                fontSize: '0.8125rem',
                fontWeight: 700,
                color: 'var(--color-accent)',
              }}
            >
              Edit Content →
            </Link>
          </div>
        </div>
      </div>

      {/* Analytics Breakdown & Founding Roster Snapshot */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '24px',
          marginBottom: '36px',
        }}
      >
        {/* Pipeline Distribution Card */}
        <div className="admin-card" style={{ padding: '28px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--color-primary)' }}>
              Application Pipeline Status
            </h3>
            <Link
              href="/admin/leads"
              style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-accent)' }}
            >
              Manage Statuses →
            </Link>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {/* Status 1: New */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', marginBottom: '6px' }}>
                <span style={{ fontWeight: 600, color: '#2563EB' }}>● New & Awaiting Review</span>
                <span style={{ fontWeight: 700 }}>{newLeadsCount}</span>
              </div>
              <div style={{ height: '8px', backgroundColor: '#F1F5F9', borderRadius: '4px', overflow: 'hidden' }}>
                <div
                  style={{
                    height: '100%',
                    width: `${totalLeads > 0 ? (newLeadsCount / totalLeads) * 100 : 0}%`,
                    backgroundColor: '#3B82F6',
                    borderRadius: '4px',
                  }}
                />
              </div>
            </div>

            {/* Status 2: In Review */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', marginBottom: '6px' }}>
                <span style={{ fontWeight: 600, color: '#D97706' }}>● In Discussion / Reviewing</span>
                <span style={{ fontWeight: 700 }}>{reviewedCount}</span>
              </div>
              <div style={{ height: '8px', backgroundColor: '#F1F5F9', borderRadius: '4px', overflow: 'hidden' }}>
                <div
                  style={{
                    height: '100%',
                    width: `${totalLeads > 0 ? (reviewedCount / totalLeads) * 100 : 0}%`,
                    backgroundColor: '#F59E0B',
                    borderRadius: '4px',
                  }}
                />
              </div>
            </div>

            {/* Status 3: Approved */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', marginBottom: '6px' }}>
                <span style={{ fontWeight: 600, color: '#059669' }}>● Approved for Cohort</span>
                <span style={{ fontWeight: 700 }}>{approvedCount}</span>
              </div>
              <div style={{ height: '8px', backgroundColor: '#F1F5F9', borderRadius: '4px', overflow: 'hidden' }}>
                <div
                  style={{
                    height: '100%',
                    width: `${totalLeads > 0 ? (approvedCount / totalLeads) * 100 : 0}%`,
                    backgroundColor: '#10B981',
                    borderRadius: '4px',
                  }}
                />
              </div>
            </div>

            {/* Status 4: Archived/Rejected */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', marginBottom: '6px' }}>
                <span style={{ fontWeight: 600, color: '#64748B' }}>● Archived / Rejected</span>
                <span style={{ fontWeight: 700 }}>{rejectedCount}</span>
              </div>
              <div style={{ height: '8px', backgroundColor: '#F1F5F9', borderRadius: '4px', overflow: 'hidden' }}>
                <div
                  style={{
                    height: '100%',
                    width: `${totalLeads > 0 ? (rejectedCount / totalLeads) * 100 : 0}%`,
                    backgroundColor: '#94A3B8',
                    borderRadius: '4px',
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Founding Roster Preview Card */}
        <div className="admin-card" style={{ padding: '28px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--color-primary)' }}>
              Founding Leaders Roster
            </h3>
            <Link
              href="/admin/leaders"
              style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-accent)' }}
            >
              All {leaders.length} Leaders →
            </Link>
          </div>

          {leaders.length === 0 ? (
            <div style={{ padding: '24px', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
              No leaders added yet.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {leaders.slice(0, 4).map((leader) => (
                <div
                  key={leader.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    backgroundColor: '#F8FAFC',
                    border: '1px solid #F1F5F9',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div
                      style={{
                        position: 'relative',
                        width: '36px',
                        height: '36px',
                        borderRadius: '50%',
                        overflow: 'hidden',
                        backgroundColor: '#E2E8F0',
                        flexShrink: 0,
                      }}
                    >
                      {leader.photoUrl ? (
                        <Image
                          src={leader.photoUrl}
                          alt={leader.name}
                          fill
                          sizes="36px"
                          style={{ objectFit: 'cover' }}
                        />
                      ) : (
                        <div
                          style={{
                            width: '100%',
                            height: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 700,
                            color: 'var(--color-primary)',
                            fontSize: '0.75rem',
                          }}
                        >
                          {leader.name.charAt(0)}
                        </div>
                      )}
                    </div>
                    <div>
                      <span
                        style={{
                          fontSize: '0.875rem',
                          fontWeight: 700,
                          color: 'var(--color-primary)',
                          display: 'block',
                        }}
                      >
                        {leader.name}
                      </span>
                      <span
                        style={{
                          fontSize: '0.75rem',
                          color: 'var(--color-text-muted)',
                          display: 'block',
                        }}
                      >
                        {leader.company}
                      </span>
                    </div>
                  </div>

                  <span
                    style={{
                      fontSize: '0.6875rem',
                      fontWeight: 600,
                      padding: '2px 8px',
                      borderRadius: '4px',
                      backgroundColor: leader.published ? '#ECFDF5' : '#F1F5F9',
                      color: leader.published ? '#047857' : '#64748B',
                    }}
                  >
                    {leader.published ? 'LIVE' : 'DRAFT'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick Power Actions Bar */}
      <div style={{ marginBottom: '36px' }}>
        <h3
          style={{
            fontSize: '1rem',
            fontWeight: 700,
            color: 'var(--color-primary)',
            marginBottom: '16px',
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
          }}
        >
          Quick Action Shortcuts
        </h3>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '16px',
          }}
        >
          <Link
            href="/admin/content"
            className="admin-card admin-card-interactive"
            style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '1.25rem' }}>📝</span>
              <h4 style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--color-primary)' }}>
                Website Copy Editor
              </h4>
            </div>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.8125rem', lineHeight: 1.4 }}>
              Edit headlines, hero messaging, value proposition, and privacy terms.
            </p>
          </Link>

          <Link
            href="/admin/leaders"
            className="admin-card admin-card-interactive"
            style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '1.25rem' }}>👤</span>
              <h4 style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--color-primary)' }}>
                Founding 50 Profiles
              </h4>
            </div>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.8125rem', lineHeight: 1.4 }}>
              Upload leader headshots, bios, LinkedIn profiles, and reorder members.
            </p>
          </Link>

          <Link
            href="/admin/voices"
            className="admin-card admin-card-interactive"
            style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '1.25rem' }}>💬</span>
              <h4 style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--color-primary)' }}>
                Community Voices
              </h4>
            </div>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.8125rem', lineHeight: 1.4 }}>
              Curate and publish high-impact testimonial quotes from industry leaders.
            </p>
          </Link>

          <Link
            href="/admin/settings"
            className="admin-card admin-card-interactive"
            style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '1.25rem' }}>⚙️</span>
              <h4 style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--color-primary)' }}>
                Site Settings & Revalidation
              </h4>
            </div>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.8125rem', lineHeight: 1.4 }}>
              Configure social URLs, metadata descriptions, and refresh site cache.
            </p>
          </Link>
        </div>
      </div>

      {/* Recent Applications Interactive Table */}
      <RecentLeadsTable leads={leads} />
    </div>
  );
}
