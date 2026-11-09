export interface AdminUser {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  user_type: string;
  is_active: boolean;
  last_login_at: string | null;
  created_at: string;
  roles?: Array<{
    id: number;
    name: string;
    label: string;
  }>;
}

export interface AdminRole {
  id: number;
  name: string;
  label: string;
  description?: string;
  permissions?: Array<{
    id: number;
    name: string;
    label: string;
    module: string;
  }>;
}

export interface UserPayload {
  name: string;
  email: string;
  phone?: string;
  password?: string;
  role_ids?: number[];
  is_active?: boolean;
}

