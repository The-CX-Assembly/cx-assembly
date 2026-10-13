import { getAdminSession } from '@/lib/auth-session';
import AdminNavbar from '@/components/admin/AdminNavbar';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getAdminSession();

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F8FAFC', display: 'flex', flexDirection: 'column' }}>
      {session && <AdminNavbar userEmail={session.email} />}
      <main style={{ flex: 1 }}>{children}</main>
    </div>
  );
}
