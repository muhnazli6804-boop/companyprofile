import { apiClient } from "@/lib/api-client";
import { RegistrationPeriod, RegistrationPeriodPayload, PeriodQuota } from "./types";

export const getRegistrationPeriods = async (params?: { is_active?: boolean; academic_year?: string }) => {
  const response = await apiClient.get<{ data: RegistrationPeriod[] }>("/admin/registration-periods", { params });
  return response.data.data;
};

export const getRegistrationPeriodById = async (id: number) => {
  const response = await apiClient.get<{ data: RegistrationPeriod }>(`/admin/registration-periods/${id}`);
  return response.data.data;
};

export const createRegistrationPeriod = async (payload: RegistrationPeriodPayload) => {
  const response = await apiClient.post<{ message: string; data: RegistrationPeriod }>("/admin/registration-periods", payload);
  return response.data;
};

export const updateRegistrationPeriod = async (id: number, payload: Partial<RegistrationPeriodPayload>) => {
  const response = await apiClient.put<{ message: string; data: RegistrationPeriod }>(`/admin/registration-periods/${id}`, payload);
  return response.data;
};

export const togglePeriodActive = async (id: number) => {
  const response = await apiClient.patch<{ message: string; data: RegistrationPeriod }>(`/admin/registration-periods/${id}/active`);
  return response.data;
};

export const deleteRegistrationPeriod = async (id: number) => {
  const response = await apiClient.delete<{ message: string }>(`/admin/registration-periods/${id}`);
  return response.data;
};

export const getPeriodQuotas = async (id: number) => {
  const response = await apiClient.get<{ data: PeriodQuota[] }>(`/admin/registration-periods/${id}/quotas`);
  return response.data.data;
};

export const updatePeriodQuotas = async (id: number, quotas: Array<{ education_unit_id: number; quota: number }>) => {
  const response = await apiClient.put<{ message: string; data: PeriodQuota[] }>(`/admin/registration-periods/${id}/quotas`, { quotas });
  return response.data;
};
