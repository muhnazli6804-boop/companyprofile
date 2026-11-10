import { apiClient } from '@/lib/api-client';
import type { ApiResponse, PaginatedResponse } from '@/types';
import type { AdminUser, PermissionGroup, Role, UserFilters, UserPayload } from './types';

export const USERS_PER_PAGE = 15;

export const listUsers = async (f: UserFilters) => {
  // Kunci rata: filter[...] sesuai Rancangan-API §11.2; filter kosong tidak dikirim.
  const params: Record<string, string | number> = { page: f.page, per_page: USERS_PER_PAGE };
  if (f.q) params.q = f.q;
  if (f.user_type) params['filter[user_type]'] = f.user_type;
  if (f.role) params['filter[role]'] = f.role;
  if (f.is_active) params['filter[is_active]'] = f.is_active;
  return (await apiClient.get<PaginatedResponse<AdminUser>>('/admin/users', { params })).data;
};

export const createUser = async (p: UserPayload) => (await apiClient.post<ApiResponse<AdminUser>>('/admin/users', p)).data.data;

export const updateUser = async (id: number, p: UserPayload) =>
  (await apiClient.put<ApiResponse<AdminUser>>(`/admin/users/${id}`, p)).data.data;

export const setUserActive = async (id: number, is_active: boolean) =>
  (await apiClient.patch<ApiResponse<AdminUser>>(`/admin/users/${id}/active`, { is_active })).data.data;

export const resetUserPassword = async (id: number) =>
  (await apiClient.post<{ message: string }>(`/admin/users/${id}/reset-password`)).data;

/** Backend menerima NAMA role (bukan id), berbeda dari create/update. */
export const promoteUser = async (id: number, roles: string[]) =>
  (await apiClient.post<ApiResponse<AdminUser>>(`/admin/users/${id}/promote`, { roles })).data.data;

export const deleteUser = async (id: number) => {
  await apiClient.delete(`/admin/users/${id}`);
};

export const listRoles = async () => (await apiClient.get<ApiResponse<Role[]>>('/admin/roles')).data.data;

export const listPermissionGroups = async () =>
  (await apiClient.get<ApiResponse<PermissionGroup[]>>('/admin/permissions')).data.data;

export const updateRolePermissions = async (id: number, permissions: string[]) =>
  (await apiClient.put<ApiResponse<Role>>(`/admin/roles/${id}/permissions`, { permissions })).data.data;

export interface ApiErrorInfo {
  status?: number;
  code?: string;
  message: string;
  errors?: Record<string, string[]>;
}

export function apiErrorInfo(err: unknown): ApiErrorInfo {
  const res = (err as { response?: { status?: number; data?: { message?: string; code?: string; errors?: Record<string, string[]> } } })
    .response;
  if (!res) return { message: 'Tidak dapat terhubung ke server. Periksa koneksi Anda.' };
  return {
    status: res.status,
    code: res.data?.code,
    message: res.data?.message ?? 'Terjadi kesalahan. Coba lagi.',
    errors: res.data?.errors,
  };
}
