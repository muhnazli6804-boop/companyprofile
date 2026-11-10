// Hanya dipakai tes: fixture dan mock apiClient untuk halaman Pengguna & Role.
import { vi } from 'vitest';
import { render } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import type { ReactElement } from 'react';
import { apiClient } from '@/lib/api-client';
import type { AdminUser, Permission, PermissionGroup, Role } from './types';

export const api = vi.mocked(apiClient) as unknown as {
  get: ReturnType<typeof vi.fn>;
  post: ReturnType<typeof vi.fn>;
  put: ReturnType<typeof vi.fn>;
  patch: ReturnType<typeof vi.fn>;
  delete: ReturnType<typeof vi.fn>;
};

const perm = (id: number, name: string, label: string, group_name: string): Permission => ({ id, name, label, group_name });

export const PERMISSIONS = {
  dashboard: perm(1, 'dashboard.view', 'Melihat Dashboard', 'Ringkasan'),
  content: perm(2, 'content.manage', 'Mengelola Konten', 'Konten'),
  users: perm(3, 'users.manage', 'Mengelola Pengguna', 'Sistem'),
};

export const PERMISSION_GROUPS: PermissionGroup[] = [
  { group_name: 'Ringkasan', permissions: [PERMISSIONS.dashboard] },
  { group_name: 'Konten', permissions: [PERMISSIONS.content] },
  { group_name: 'Sistem', permissions: [PERMISSIONS.users] },
];

export const ROLES: Role[] = [
  { id: 1, name: 'super_admin', label: 'Super Admin', description: null, users_count: 1, permissions: Object.values(PERMISSIONS) },
  { id: 2, name: 'admin_registration', label: 'Admin Pendaftaran', description: null, users_count: 2, permissions: [PERMISSIONS.dashboard] },
  { id: 3, name: 'admin_content', label: 'Admin Konten', description: null, users_count: 1, permissions: [PERMISSIONS.dashboard, PERMISSIONS.content] },
];

const user = (over: Partial<AdminUser>): AdminUser => ({
  id: 10, name: 'Sari Konten', email: 'sari@padindi.test', phone: null, user_type: 'admin', is_active: true,
  email_verified_at: '2026-01-01T00:00:00Z',
  last_login_at: null, created_at: '2026-01-01T00:00:00Z', roles: [{ id: 3, name: 'admin_content', label: 'Admin Konten' }], ...over,
});

export const USERS: AdminUser[] = [
  user({ id: 1, name: 'Budi Super', email: 'budi@padindi.test', roles: [{ id: 1, name: 'super_admin', label: 'Super Admin' }], last_login_at: '2026-03-05T08:00:00Z' }),
  user({ id: 10 }),
  user({ id: 20, name: 'Wali Murid', email: 'wali@padindi.test', user_type: 'applicant', roles: [], is_active: false }),
  user({ id: 21, name: 'Calon Guru', email: 'guru@padindi.test', user_type: 'applicant', roles: [] }),
  user({ id: 22, name: 'Belum Verifikasi', email: 'baru@padindi.test', user_type: 'applicant', roles: [], email_verified_at: null }),
];

export const usersPage = (data: AdminUser[], over: { current_page?: number; last_page?: number; total?: number } = {}) => ({
  data,
  links: {},
  meta: { current_page: 1, per_page: 15, last_page: 1, total: data.length, ...over },
});

type Me = { id: number; roles: string[]; permissions: string[] };
export const SUPER_ME: Me = { id: 1, roles: ['super_admin'], permissions: ['users.manage'] };
export const MANAGER_ME: Me = { id: 5, roles: ['kustom'], permissions: ['users.manage'] };

/** Mengarahkan apiClient.get per URL; `handlers` menimpa bawaan. */
export function mockGet(me: Me = SUPER_ME, handlers: Record<string, () => unknown> = {}) {
  api.get.mockImplementation((url: string) => {
    const table: Record<string, () => unknown> = {
      '/auth/me': () => ({ data: { data: { name: 'Pengguna', user_type: 'admin', ...me } } }),
      '/admin/users': () => ({ data: usersPage(USERS) }),
      '/admin/roles': () => ({ data: { data: ROLES } }),
      '/admin/permissions': () => ({ data: { data: PERMISSION_GROUPS } }),
      ...handlers,
    };
    const h = table[url];
    return h ? Promise.resolve(h()) : Promise.reject(new Error(`GET tak terduga: ${url}`));
  });
}

export const apiError = (status: number, body: { message: string; code?: string; errors?: Record<string, string[]> }) => ({
  response: { status, data: body },
});

export function renderWithProviders(ui: ReactElement, path = '/admin/pengguna') {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[path]}>{ui}</MemoryRouter>
    </QueryClientProvider>,
  );
}
