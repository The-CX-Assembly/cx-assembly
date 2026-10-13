import { redirect } from 'next/navigation';
import { getAdminSession } from '@/lib/auth-session';
import { getAdminDb } from '@/lib/firebase-admin';
import LeadsManager from '@/components/admin/LeadsManager';
import { Lead } from '@/types';

export default async function AdminLeadsPage() {
  const session = await getAdminSession();
  if (!session) {
    redirect('/admin/login');
  }

  const db = getAdminDb();
  const leads: Lead[] = [];

  if (db) {
    try {
      const snap = await db.collection('leads').orderBy('createdAt', 'desc').get();
      snap.forEach((doc) => {
        leads.push({ id: doc.id, ...(doc.data() as Omit<Lead, 'id'>) });
      });
    } catch (e) {
      console.warn('Error fetching all leads:', e);
    }
  }

  return (
    <div className="container" style={{ paddingTop: '40px', paddingBottom: '60px' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '1.875rem', fontWeight: 800, color: 'var(--color-primary)', marginBottom: '6px' }}>
          Applications & Inquiries ({leads.length})
        </h1>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9375rem' }}>
          Review membership applications from brand-side CX heads and partnership requests. Export anytime to CSV.
        </p>
      </div>

      <LeadsManager initialLeads={leads} />
    </div>
  );
}
