import { apiClient } from '@/lib/api-client';
import type { ApiResponse, PaginatedResponse } from '@/types';
import type { AdminStudentApplication, StudentFilterParams } from './types';

export async function fetchStudentApplications(
  params: StudentFilterParams = {}
): Promise<PaginatedResponse<AdminStudentApplication>> {
  const res = await apiClient.get<PaginatedResponse<AdminStudentApplication>>(
    '/admin/student-applications',
    { params }
  );
  return res.data;
}

export async function fetchStudentApplicationDetail(
  id: number | string
): Promise<AdminStudentApplication> {
  const res = await apiClient.get<ApiResponse<AdminStudentApplication>>(
    `/admin/student-applications/${id}`
  );
  return res.data.data;
}

export async function updateStudentApplicationStatus(
  id: number | string,
  data: { status: string; note?: string }
): Promise<AdminStudentApplication> {
  const res = await apiClient.patch<ApiResponse<AdminStudentApplication>>(
    `/admin/student-applications/${id}/status`,
    data
  );
  return res.data.data;
}

export async function updateStudentApplicationNote(
  id: number | string,
  data: { admin_note: string }
): Promise<AdminStudentApplication> {
  const res = await apiClient.patch<ApiResponse<AdminStudentApplication>>(
    `/admin/student-applications/${id}/note`,
    data
  );
  return res.data.data;
}

export async function bulkUpdateStudentStatus(data: {
  ids: number[];
  status: string;
  note?: string;
}): Promise<{ message: string; updated_count: number }> {
  const res = await apiClient.post<ApiResponse<{ message: string; updated_count: number }>>(
    '/admin/student-applications/bulk-status',
    data
  );
  return res.data.data;
}

export async function verifyStudentDocument(
  documentId: number | string,
  data: { verification_status: 'valid' | 'invalid' | 'pending'; verification_note?: string }
) {
  const res = await apiClient.patch(`/admin/documents/${documentId}/verification`, data);
  return res.data;
}

export function getStudentExportUrl(params: StudentFilterParams = {}): string {
  const searchParams = new URLSearchParams();
  if (params.status) searchParams.set('status', params.status);
  if (params.education_unit_id) searchParams.set('education_unit_id', String(params.education_unit_id));
  return `/api/v1/admin/student-applications/export?${searchParams.toString()}`;
}
