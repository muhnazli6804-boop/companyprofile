import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as api from './api';
import type { Role, UserFilters, UserPayload } from './types';

const USERS = ['admin', 'users'];
const ROLES = ['admin', 'roles'];

export const useUsers = (filters: UserFilters) =>
  useQuery({ queryKey: [...USERS, filters], queryFn: () => api.listUsers(filters), placeholderData: keepPreviousData });

export const useRoles = () => useQuery({ queryKey: ROLES, queryFn: api.listRoles });

export const usePermissionGroups = () => useQuery({ queryKey: ['admin', 'permissions'], queryFn: api.listPermissionGroups });

// Setelah perubahan akun, daftar pengguna dan jumlah anggota role dimuat ulang; 404 berarti daftar sudah usang.
function useUserMutation<TVars, TData>(fn: (vars: TVars) => Promise<TData>) {
  const queryClient = useQueryClient();
  const refresh = () => Promise.all([queryClient.invalidateQueries({ queryKey: USERS }), queryClient.invalidateQueries({ queryKey: ROLES })]);
  return useMutation({
    mutationFn: fn,
    onSuccess: refresh,
    onError: (err) => {
      if (api.apiErrorInfo(err).status === 404) void refresh();
    },
  });
}

export const useCreateUser = () => useUserMutation((p: UserPayload) => api.createUser(p));
export const useUpdateUser = () => useUserMutation((v: { id: number; payload: UserPayload }) => api.updateUser(v.id, v.payload));
export const useSetUserActive = () => useUserMutation((v: { id: number; is_active: boolean }) => api.setUserActive(v.id, v.is_active));
export const useResetUserPassword = () => useUserMutation((id: number) => api.resetUserPassword(id));
export const usePromoteUser = () => useUserMutation((v: { id: number; roles: string[] }) => api.promoteUser(v.id, v.roles));
export const useDeleteUser =() => useUserMutation((id: number) => api.deleteUser(id));

export const useUpdateRolePermissions = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (v: { id: number; permissions: string[] }) => api.updateRolePermissions(v.id, v.permissions),
    // Respons sudah memuat role terbaru: tulis ke cache agar matriks tidak sempat kembali ke nilai lama.
    onSuccess: (role) =>
      queryClient.setQueryData<Role[]>(ROLES, (old) => old?.map((r) => (r.id === role.id ? role : r))),
  });
};
