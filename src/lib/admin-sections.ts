// Shared by server and client: the admin areas a user can be granted.

export const ADMIN_SECTIONS = [
  { key: 'dashboard', label: 'Dashboard', href: '/admin', description: 'Overview charts and recent activity' },
  { key: 'leads', label: 'Leads Inbox', href: '/admin/leads', description: 'Applications, statuses and CSV export' },
  { key: 'leaders', label: 'Founding Leaders', href: '/admin/leaders', description: 'Leader profiles and headshots' },
  { key: 'content', label: 'Content Editor', href: '/admin/content', description: 'Website copy for every section' },
  { key: 'settings', label: 'Settings', href: '/admin/settings', description: 'Site metadata and social links' },
] as const;

export type AdminSection = (typeof ADMIN_SECTIONS)[number]['key'];
export type AdminRole = 'superadmin' | 'admin';

export const ALL_SECTIONS: AdminSection[] = ADMIN_SECTIONS.map((s) => s.key);

export const ROLE_LABEL: Record<AdminRole, string> = {
  superadmin: 'Super Admin',
  admin: 'Admin',
};

export interface AdminAccess {
  role: AdminRole;
  sections: AdminSection[];
}

export function canAccess(user: AdminAccess, section: AdminSection) {
  return user.role === 'superadmin' || user.sections.includes(section);
}

/** Where to send a user after sign-in, or when they open a page they can't use. */
export function homePathFor(user: AdminAccess) {
  return ADMIN_SECTIONS.find((s) => canAccess(user, s.key))?.href ?? '/admin/login';
}
