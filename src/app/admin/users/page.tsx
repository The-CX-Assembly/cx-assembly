import { requireSuperadmin } from '@/features/auth/session';
import { listAdminUsers } from '@/features/users/server';
import { timeAgo } from '@/features/dashboard/stats';
import { hasAdminCredentials } from '@/server/firebase-admin';
import UsersManager from '@/features/users/components/UsersManager';

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
