import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import type { ApiResponse, User } from '@/types';

// Hanya untuk tampilan (menu, tombol). Backend tetap memutuskan lewat 403.
type Access = Pick<User, 'permissions' | 'roles'> | undefined;

export const hasPermission = (user: Access, permission: string): boolean =>
  user?.permissions?.includes(permission) ?? false;

export const isSuperAdmin = (user: Access): boolean => user?.roles?.includes('super_admin') ?? false;

const ROLE_LABELS: Record<string, string> = {
  super_admin: 'Super Admin',
  admin_registration: 'Admin Pendaftaran',
  admin_content: 'Admin Konten',
};

export const roleLabel = (name: string): string => ROLE_LABELS[name] ?? name;

// Kunci dan queryFn sama dengan RequireAdmin dan AdminLayout agar berbagi satu cache.
export const useCurrentUser = () =>
  useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      const res = await apiClient.get<ApiResponse<User>>('/auth/me');
      return res.data.data;
    },
    retry: false,
  });
