import { apiClient } from '@/lib/api-client';
import type { ApiResponse } from '@/types';
import type { TeacherApplication, TeacherRequirementItem, TeacherStatusHistoryItem } from './types';

export const getTeacherApplications = async (): Promise<TeacherApplication[]> => {
  const res = await apiClient.get<ApiResponse<TeacherApplication[]>>('/teacher-applications');
  return res.data.data;
};

export const getTeacherApplication = async (id: number | string): Promise<TeacherApplication> => {
  const res = await apiClient.get<ApiResponse<TeacherApplication>>(`/teacher-applications/${id}`);
  return res.data.data;
};

export const createTeacherApplication = async (data: {
  applied_position: string;
  education_unit_id?: number | null;
  teacher_vacancy_id?: number | null;
}): Promise<TeacherApplication> => {
  const res = await apiClient.post<ApiResponse<TeacherApplication>>('/teacher-applications', data);
  return res.data.data;
};

export const updateTeacherStep1 = async (
  id: number | string,
  data: unknown
): Promise<TeacherApplication> => {
  const res = await apiClient.put<ApiResponse<TeacherApplication>>(`/teacher-applications/${id}/steps/1`, data);
  return res.data.data;
};

export const updateTeacherStep2 = async (
  id: number | string,
  data: unknown
): Promise<TeacherApplication> => {
  const res = await apiClient.put<ApiResponse<TeacherApplication>>(`/teacher-applications/${id}/steps/2`, data);
  return res.data.data;
};

export const updateTeacherStep3 = async (
  id: number | string,
  data: { cover_letter?: string; declaration_accepted: boolean; consent_accepted: boolean }
): Promise<TeacherApplication> => {
  const res = await apiClient.put<ApiResponse<TeacherApplication>>(`/teacher-applications/${id}/steps/3`, data);
  return res.data.data;
};

export const getTeacherRequirements = async (id: number | string): Promise<TeacherRequirementItem[]> => {
  const res = await apiClient.get<ApiResponse<TeacherRequirementItem[]>>(`/teacher-applications/${id}/requirements`);
  return res.data.data;
};

export const uploadTeacherDocument = async (
  id: number | string,
  file: File,
  documentType: string,
  sequence: number = 1
) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('document_type', documentType);
  formData.append('sequence', String(sequence));

  const res = await apiClient.post(`/teacher-applications/${id}/documents`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data.data;
};

export const deleteTeacherDocument = async (id: number | string, documentId: number | string) => {
  const res = await apiClient.delete(`/teacher-applications/${id}/documents/${documentId}`);
  return res.data;
};

export const submitTeacherApplication = async (id: number | string) => {
  const res = await apiClient.post<ApiResponse<{
    id: number;
    registration_number: string;
    status: string;
    submitted_at: string;
    masked_phone: string;
    application: TeacherApplication;
  }>>(`/teacher-applications/${id}/submit`);
  return res.data.data;
};

export const getTeacherStatusHistory = async (id: number | string): Promise<TeacherStatusHistoryItem[]> => {
  const res = await apiClient.get<ApiResponse<TeacherStatusHistoryItem[]>>(`/teacher-applications/${id}/status-history`);
  return res.data.data;
};

export const deleteTeacherDraft = async (id: number | string) => {
  const res = await apiClient.delete(`/teacher-applications/${id}`);
  return res.data;
};
