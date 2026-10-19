// TODO: see Rancangan-API-Padindi.md section 1.2 & 13
export interface ApiError {
  message: string;
  code: string;
  errors?: Record<string, string[]>;
}

export interface ApiResponse<T = unknown> {
  data: T;
  message?: string;
  warnings?: Array<{ code: string; message: string }>;
}

export interface PaginatedResponse<T = unknown> {
  data: T[];
  links: {
    first?: string | null;
    last?: string | null;
    prev?: string | null;
    next?: string | null;
  };
  meta: {
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
  };
}

export interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  user_type: 'applicant' | 'admin';
  is_active: boolean;
  email_verified_at?: string;
  roles?: string[];
  permissions?: string[];
}
