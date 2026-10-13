import { redirect } from 'next/navigation';
import { getAdminSession } from '@/lib/auth-session';
import { getVoices } from '@/lib/content';
import VoicesManager from '@/components/admin/VoicesManager';

export default async function AdminVoicesPage() {
  const session = await getAdminSession();
  if (!session) {
    redirect('/admin/login');
  }

  const voices = await getVoices();

  return (
    <div className="container" style={{ paddingTop: '40px', paddingBottom: '60px' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '1.875rem', fontWeight: 800, color: 'var(--color-primary)', marginBottom: '6px' }}>
          Community Voices ({voices.length})
        </h1>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9375rem' }}>
          Add, edit, or remove executive quotes that appear on the website.
        </p>
      </div>

      <VoicesManager initialVoices={voices} />
    </div>
  );
}
