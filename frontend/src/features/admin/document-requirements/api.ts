import { apiClient } from "@/lib/api-client";
import { DocumentRequirement, DocumentRequirementPayload } from "./types";

export const getDocumentRequirements = async (params?: {
  applicant_type?: string;
  education_unit_id?: string | number;
  search?: string;
  is_active?: boolean;
}) => {
  const response = await apiClient.get<{ data: DocumentRequirement[] }>("/admin/document-requirements", { params });
  return response.data.data;
};

export const getDocumentRequirementById = async (id: number) => {
  const response = await apiClient.get<{ data: DocumentRequirement }>(`/admin/document-requirements/${id}`);
  return response.data.data;
};

export const createDocumentRequirement = async (payload: DocumentRequirementPayload) => {
  const response = await apiClient.post<{ message: string; data: DocumentRequirement }>(
    "/admin/document-requirements",
    payload
  );
  return response.data;
};

export const updateDocumentRequirement = async (id: number, payload: Partial<DocumentRequirementPayload>) => {
  const response = await apiClient.put<{ message: string; data: DocumentRequirement }>(
    `/admin/document-requirements/${id}`,
    payload
  );
  return response.data;
};

export const toggleRequirementActive = async (id: number) => {
  const response = await apiClient.patch<{ message: string; data: DocumentRequirement }>(
    `/admin/document-requirements/${id}/active`
  );
  return response.data;
};

export const deleteDocumentRequirement = async (id: number) => {
  const response = await apiClient.delete<{ message: string }>(`/admin/document-requirements/${id}`);
  return response.data;
};
