export interface RoleRef {
  id: number;
  name: string;
  label: string;
}

export interface AdminUser {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  user_type: 'admin' | 'applicant';
  is_active: boolean;
  email_verified_at: string | null;
  last_login_at: string | null;
  created_at: string;
  roles: RoleRef[];
}

export interface Permission {
  id: number;
  name: string;
  label: string;
  group_name: string;
}

export interface PermissionGroup {
  group_name: string;
  permissions: Permission[];
}

export interface Role extends RoleRef {
  description: string | null;
  users_count: number;
  permissions: Permission[];
}

export interface UserFilters {
  q: string;
  user_type: string;
  role: string;
  is_active: string;
  page: number;
}

export interface UserPayload {
  name: string;
  email: string;
  phone: string | null;
  roles: number[];
}
