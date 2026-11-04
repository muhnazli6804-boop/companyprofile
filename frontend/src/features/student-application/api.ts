import { apiClient } from '@/lib/api-client';
import type { ApiResponse } from '@/types';
import type { RequirementItem, StatusHistoryItem, StudentApplication } from './types';

export const getStudentApplications = async (): Promise<StudentApplication[]> => {
  const res = await apiClient.get<ApiResponse<StudentApplication[]>>('/student-applications');
  return res.data.data;
};

export const getStudentApplication = async (id: number | string): Promise<StudentApplication> => {
  const res = await apiClient.get<ApiResponse<StudentApplication>>(`/student-applications/${id}`);
  return res.data.data;
};

export const createStudentApplication = async (data: {
  education_unit_id: number;
  track?: string;
}): Promise<StudentApplication> => {
  const res = await apiClient.post<ApiResponse<StudentApplication>>('/student-applications', data);
  return res.data.data;
};

export const updateStudentStep1 = async (
  id: number | string,
  data: { education_unit_id?: number; student: unknown }
): Promise<StudentApplication> => {
  const res = await apiClient.put<ApiResponse<StudentApplication>>(`/student-applications/${id}/steps/1`, data);
  return res.data.data;
};

export const updateStudentStep2 = async (
  id: number | string,
  data: { guardians: unknown[] }
): Promise<StudentApplication> => {
  const res = await apiClient.put<ApiResponse<StudentApplication>>(`/student-applications/${id}/steps/2`, data);
  return res.data.data;
};

export const updateStudentStep3 = async (
  id: number | string,
  data: { declaration_accepted: boolean; consent_accepted: boolean; track?: string }
): Promise<StudentApplication> => {
  const res = await apiClient.put<ApiResponse<StudentApplication>>(`/student-applications/${id}/steps/3`, data);
  return res.data.data;
};

export const getStudentRequirements = async (id: number | string): Promise<RequirementItem[]> => {
  const res = await apiClient.get<ApiResponse<RequirementItem[]>>(`/student-applications/${id}/requirements`);
  return res.data.data;
};

export const uploadStudentDocument = async (
  id: number | string,
  file: File,
  documentType: string,
  sequence: number = 1
) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('document_type', documentType);
  formData.append('sequence', String(sequence));

  const res = await apiClient.post(`/student-applications/${id}/documents`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data.data;
};

export const deleteStudentDocument = async (id: number | string, documentId: number | string) => {
  const res = await apiClient.delete(`/student-applications/${id}/documents/${documentId}`);
  return res.data;
};

export const submitStudentApplication = async (id: number | string) => {
  const res = await apiClient.post<ApiResponse<{
    id: number;
    registration_number: string;
    status: string;
    submitted_at: string;
    application: StudentApplication;
  }>>(`/student-applications/${id}/submit`);
  return res.data.data;
};

export const getStudentStatusHistory = async (id: number | string): Promise<StatusHistoryItem[]> => {
  const res = await apiClient.get<ApiResponse<StatusHistoryItem[]>>(`/student-applications/${id}/status-history`);
  return res.data.data;
};

export const deleteStudentDraft = async (id: number | string) => {
  const res = await apiClient.delete(`/student-applications/${id}`);
  return res.data;
};
