import { redirect } from 'next/navigation';
import { getAdminSession } from '@/lib/auth-session';
import { getSiteContent } from '@/lib/content';
import ContentEditor from '@/components/admin/ContentEditor';

export default async function AdminContentPage() {
  const session = await getAdminSession();
  if (!session) {
    redirect('/admin/login');
  }

  const content = await getSiteContent();

  return (
    <div className="container" style={{ paddingTop: '40px', paddingBottom: '60px' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '1.875rem', fontWeight: 800, color: 'var(--color-primary)', marginBottom: '6px' }}>
          Edit Website Copy & Sections
        </h1>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9375rem' }}>
          Modify any text section on the website. Submitting saves directly to Firestore and refreshes the live pages immediately.
        </p>
      </div>

      <ContentEditor initialContent={content} />
    </div>
  );
}
