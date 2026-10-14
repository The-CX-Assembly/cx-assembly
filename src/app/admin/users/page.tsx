import { requireSuperadmin } from '@/lib/auth-session';
import { listAdminUsers } from '@/lib/admin-users';
import { timeAgo } from '@/lib/admin-stats';
import { hasAdminCredentials } from '@/lib/firebase-admin';
import UsersManager from '@/components/admin/UsersManager';

export default async function AdminUsersPage() {
  const me = await requireSuperadmin();
  const users = await listAdminUsers();

  return (
    <UsersManager
      currentEmail={me.email}
      canWrite={hasAdminCredentials()}
      users={users.map((u) => ({
        ...u,
        lastSeen: u.lastLoginAt ? timeAgo(u.lastLoginAt) : 'Never signed in',
        addedBy: u.createdBy ?? null,
      }))}
    />
  );
}
