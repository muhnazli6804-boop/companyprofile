import { apiClient } from "@/lib/api-client";
import { AdminUser, AdminRole, UserPayload } from "./types";

export const getUsers = async (params?: { search?: string; role_id?: number | string; is_active?: boolean; page?: number }) => {
  const response = await apiClient.get<{
    data: AdminUser[];
    meta: { current_page: number; last_page: number; total: number };
  }>("/admin/users", { params });
  return response.data;
};

export const getUserById = async (id: number) => {
  const response = await apiClient.get<{ data: AdminUser }>(`/admin/users/${id}`);
  return response.data.data;
};

export const createUser = async (payload: UserPayload) => {
  const response = await apiClient.post<{ message: string; data: AdminUser }>("/admin/users", payload);
  return response.data;
};

export const updateUser = async (id: number, payload: Partial<UserPayload>) => {
  const response = await apiClient.put<{ message: string; data: AdminUser }>(`/admin/users/${id}`, payload);
  return response.data;
};

export const toggleUserActive = async (id: number) => {
  const response = await apiClient.patch<{ message: string; data: AdminUser }>(`/admin/users/${id}/active`);
  return response.data;
};

export const resetUserPassword = async (id: number, password: string) => {
  const response = await apiClient.post<{ message: string }>(`/admin/users/${id}/reset-password`, { password });
  return response.data;
};

export const deleteUser = async (id: number) => {
  const response = await apiClient.delete<{ message: string }>(`/admin/users/${id}`);
  return response.data;
};

export const getRoles = async () => {
  const response = await apiClient.get<{ data: AdminRole[] }>("/admin/roles");
  return response.data.data;
};

export const updateRolePermissions = async (roleId: number, permissionIds: number[]) => {
  const response = await apiClient.put<{ message: string; data: AdminRole }>(`/admin/roles/${roleId}/permissions`, {
    permission_ids: permissionIds,
  });
  return response.data;
};

export const getPermissions = async () => {
  const response = await apiClient.get<{ data: Array<{ id: number; name: string; label: string; module: string }> }>("/admin/permissions");
  return response.data.data;
};
