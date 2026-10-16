import type { AdminRole, AdminSection } from '@/modules/auth/models/access.model';

export interface AdminUser {
  email: string;
  name: string;
  role: AdminRole;
  sections: AdminSection[];
  active: boolean;
  /** Super admins defined in code; they can't be edited or removed from the UI. */
  builtIn?: boolean;
  createdAt?: string;
  createdBy?: string;
  updatedAt?: string;
  lastLoginAt?: string;
}
