import { apiClient } from "@/lib/api-client";
import { EducationUnit, EducationUnitPayload } from "./types";

export const getEducationUnits = async (params?: { search?: string; level?: string; is_active?: boolean }) => {
  const response = await apiClient.get<{ data: EducationUnit[] }>("/admin/education-units", { params });
  return response.data.data;
};

export const getEducationUnitById = async (id: number) => {
  const response = await apiClient.get<{ data: EducationUnit }>(`/admin/education-units/${id}`);
  return response.data.data;
};

export const createEducationUnit = async (payload: EducationUnitPayload) => {
  const response = await apiClient.post<{ message: string; data: EducationUnit }>("/admin/education-units", payload);
  return response.data;
};

export const updateEducationUnit = async (id: number, payload: Partial<EducationUnitPayload>) => {
  const response = await apiClient.put<{ message: string; data: EducationUnit }>(`/admin/education-units/${id}`, payload);
  return response.data;
};

export const toggleUnitActive = async (id: number) => {
  const response = await apiClient.patch<{ message: string; data: EducationUnit }>(`/admin/education-units/${id}/active`);
  return response.data;
};

export const deleteEducationUnit = async (id: number) => {
  const response = await apiClient.delete<{ message: string }>(`/admin/education-units/${id}`);
  return response.data;
};

export const uploadUnitMedia = async (id: number, type: "logo" | "cover", file: File) => {
  const formData = new FormData();
  formData.append("type", type);
  formData.append("file", file);
  const response = await apiClient.post<{ message: string; data: { path: string; url: string } }>(
    `/admin/education-units/${id}/media`,
    formData,
    {
      headers: { "Content-Type": "multipart/form-data" },
    }
  );
  return response.data;
};
