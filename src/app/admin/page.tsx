import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getAdminSession } from '@/lib/auth-session';
import { getAdminDb } from '@/lib/firebase-admin';
import { getLeaders, getVoices } from '@/lib/content';
import { Lead } from '@/types';

export default async function AdminDashboardPage() {
  const session = await getAdminSession();
  if (!session) {
    redirect('/admin/login');
  }

  const db = getAdminDb();
  let leads: Lead[] = [];
  if (db) {
    try {
      const snap = await db.collection('leads').orderBy('createdAt', 'desc').limit(10).get();
      snap.forEach((doc) => {
        leads.push({ id: doc.id, ...(doc.data() as Omit<Lead, 'id'>) });
      });
    } catch (e) {
      console.warn('Could not load leads for dashboard:', e);
    }
  }

  const leaders = await getLeaders();
  const voices = await getVoices();

  const newLeadsCount = leads.filter((l) => l.status === 'new').length;

  return (
    <div className="container" style={{ paddingTop: '40px', paddingBottom: '60px' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '1.875rem', fontWeight: 800, color: 'var(--color-primary)', marginBottom: '6px' }}>
          Welcome, {session.email}
        </h1>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9375rem' }}>
          Here is an overview of website leads, founding cohort members, and content status.
        </p>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '36px' }}>
        <div style={{ background: '#FFFFFF', padding: '24px', borderRadius: 'var(--radius-lg)', border: '1px solid #E2E8F0', boxShadow: 'var(--shadow-sm)' }}>
          <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            New Applications
          </span>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginTop: '8px' }}>
            <span style={{ fontSize: '2.25rem', fontWeight: 800, color: '#2563EB' }}>
              {newLeadsCount}
            </span>
            <span style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>awaiting review</span>
          </div>
          <Link href="/admin/leads" style={{ display: 'inline-block', marginTop: '12px', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-accent)' }}>
            Review Inbox →
          </Link>
        </div>

        <div style={{ background: '#FFFFFF', padding: '24px', borderRadius: 'var(--radius-lg)', border: '1px solid #E2E8F0', boxShadow: 'var(--shadow-sm)' }}>
          <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Total Leads
          </span>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginTop: '8px' }}>
            <span style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--color-primary)' }}>
              {leads.length}
            </span>
          </div>
          <Link href="/admin/leads" style={{ display: 'inline-block', marginTop: '12px', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-accent)' }}>
            Export CSV →
          </Link>
        </div>

        <div style={{ background: '#FFFFFF', padding: '24px', borderRadius: 'var(--radius-lg)', border: '1px solid #E2E8F0', boxShadow: 'var(--shadow-sm)' }}>
          <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Founding Leaders
          </span>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginTop: '8px' }}>
            <span style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--color-gold)' }}>
              {leaders.length}
            </span>
            <span style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>profiles live</span>
          </div>
          <Link href="/admin/leaders" style={{ display: 'inline-block', marginTop: '12px', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-accent)' }}>
            Manage Profiles →
          </Link>
        </div>

        <div style={{ background: '#FFFFFF', padding: '24px', borderRadius: 'var(--radius-lg)', border: '1px solid #E2E8F0', boxShadow: 'var(--shadow-sm)' }}>
          <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Community Voices
          </span>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginTop: '8px' }}>
            <span style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--color-primary)' }}>
              {voices.length}
            </span>
            <span style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>quotes</span>
          </div>
          <Link href="/admin/voices" style={{ display: 'inline-block', marginTop: '12px', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-accent)' }}>
            Edit Voices →
          </Link>
        </div>
      </div>

      {/* Quick Action Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '40px' }}>
        <div style={{ background: '#FFFFFF', padding: '28px', borderRadius: 'var(--radius-lg)', border: '1px solid #E2E8F0' }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--color-primary)', marginBottom: '8px' }}>
            Update Website Content
          </h3>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', marginBottom: '16px', lineHeight: 1.5 }}>
            Edit any headline, copy, philosophy pillar, partner note, or privacy policy with instant live revalidation.
          </p>
          <Link href="/admin/content" className="btn btn-outline-navy" style={{ fontSize: '0.875rem', padding: '8px 16px' }}>
            Edit Website Copy
          </Link>
        </div>

        <div style={{ background: '#FFFFFF', padding: '28px', borderRadius: 'var(--radius-lg)', border: '1px solid #E2E8F0' }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--color-primary)', marginBottom: '8px' }}>
            Founding 50 Profiles & Headshots
          </h3>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', marginBottom: '16px', lineHeight: 1.5 }}>
            Add new speaker profiles, update bios, link LinkedIn profiles, and reorder members.
          </p>
          <Link href="/admin/leaders" className="btn btn-outline-navy" style={{ fontSize: '0.875rem', padding: '8px 16px' }}>
            Manage Leaders
          </Link>
        </div>
      </div>

      {/* Recent Leads Preview */}
      <div style={{ background: '#FFFFFF', borderRadius: 'var(--radius-lg)', border: '1px solid #E2E8F0', padding: '28px', boxShadow: 'var(--shadow-sm)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-primary)' }}>
              Recent Applications
            </h2>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
              Latest inquiries submitted through the website form
            </p>
          </div>
          <Link href="/admin/leads" className="btn btn-primary" style={{ fontSize: '0.8125rem', padding: '8px 16px' }}>
            View All Leads
          </Link>
        </div>

        {leads.length === 0 ? (
          <p style={{ padding: '32px', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '0.9375rem' }}>
            No leads received yet. Test by submitting an application from the home page.
          </p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #E2E8F0', color: 'var(--color-text-muted)' }}>
                  <th style={{ padding: '12px 16px' }}>Name</th>
                  <th style={{ padding: '12px 16px' }}>Role / Company</th>
                  <th style={{ padding: '12px 16px' }}>Email</th>
                  <th style={{ padding: '12px 16px' }}>Interest</th>
                  <th style={{ padding: '12px 16px' }}>Date</th>
                  <th style={{ padding: '12px 16px' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {leads.slice(0, 5).map((lead) => (
                  <tr key={lead.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                    <td style={{ padding: '14px 16px', fontWeight: 600, color: 'var(--color-primary)' }}>
                      {lead.fullName}
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      {lead.designation} • <span style={{ color: 'var(--color-text-muted)' }}>{lead.company}</span>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <a href={`mailto:${lead.email}`} style={{ color: 'var(--color-accent)' }}>{lead.email}</a>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <span className="badge-pill badge-navy" style={{ fontSize: '0.6875rem' }}>
                        {lead.type === 'cx_leader' ? 'CX Leader' : lead.type === 'partner' ? 'Partner' : 'General'}
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px', color: 'var(--color-text-muted)', fontSize: '0.8125rem' }}>
                      {new Date(lead.createdAt).toLocaleDateString()}
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <span
                        style={{
                          display: 'inline-block',
                          padding: '3px 8px',
                          borderRadius: '4px',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          backgroundColor:
                            lead.status === 'new'
                              ? '#EFF6FF'
                              : lead.status === 'approved'
                              ? '#ECFDF5'
                              : lead.status === 'rejected'
                              ? '#FEF2F2'
                              : '#F8FAFC',
                          color:
                            lead.status === 'new'
                              ? '#1D4ED8'
                              : lead.status === 'approved'
                              ? '#047857'
                              : lead.status === 'rejected'
                              ? '#B91C1C'
                              : '#475569',
                        }}
                      >
                        {lead.status.toUpperCase()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
