import { apiClient } from "@/lib/api-client";
import { Vacancy, VacancyFilterParams, VacancyPayload } from "./types";

export const getVacancies = async (params?: VacancyFilterParams) => {
  const response = await apiClient.get<{ data: Vacancy[]; meta: { total: number; current_page: number; last_page: number } }>("/admin/vacancies", { params });
  return response.data;
};

export const getVacancyById = async (id: number) => {
  const response = await apiClient.get<{ data: Vacancy }>(`/admin/vacancies/${id}`);
  return response.data.data;
};

export const createVacancy = async (payload: VacancyPayload) => {
  const response = await apiClient.post<{ message: string; data: Vacancy }>("/admin/vacancies", payload);
  return response.data;
};

export const updateVacancy = async (id: number, payload: Partial<VacancyPayload>) => {
  const response = await apiClient.put<{ message: string; data: Vacancy }>(`/admin/vacancies/${id}`, payload);
  return response.data;
};

export const deleteVacancy = async (id: number) => {
  const response = await apiClient.delete<{ message: string }>(`/admin/vacancies/${id}`);
  return response.data;
};

export const publishVacancy = async (id: number) => {
  const response = await apiClient.patch<{ message: string; data: Vacancy }>(`/admin/vacancies/${id}/publish`);
  return response.data;
};

export const unpublishVacancy = async (id: number) => {
  const response = await apiClient.patch<{ message: string; data: Vacancy }>(`/admin/vacancies/${id}/unpublish`);
  return response.data;
};
