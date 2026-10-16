import { requireSuperadmin } from '@/middlewares/auth.middleware';
import { listAdminUsers } from '@/modules/users/services/users.service';
import { timeAgo } from '@/modules/dashboard/services/dashboard.service';
import { hasAdminCredentials } from '@/config/firebase-admin';
import UsersManager from '@/modules/users/components/UsersManager';

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
