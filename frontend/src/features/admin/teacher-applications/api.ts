import { apiClient } from '@/lib/api-client';
import type { ApiResponse, PaginatedResponse } from '@/types';
import type { AdminTeacherApplication, TeacherFilterParams } from './types';

export async function fetchTeacherApplications(
  params: TeacherFilterParams = {}
): Promise<PaginatedResponse<AdminTeacherApplication>> {
  const res = await apiClient.get<PaginatedResponse<AdminTeacherApplication>>(
    '/admin/teacher-applications',
    { params }
  );
  return res.data;
}

export async function fetchTeacherApplicationDetail(
  id: number | string
): Promise<AdminTeacherApplication> {
  const res = await apiClient.get<ApiResponse<AdminTeacherApplication>>(
    `/admin/teacher-applications/${id}`
  );
  return res.data.data;
}

export async function updateTeacherApplicationStatus(
  id: number | string,
  data: { status: string; note?: string }
): Promise<AdminTeacherApplication> {
  const res = await apiClient.patch<ApiResponse<AdminTeacherApplication>>(
    `/admin/teacher-applications/${id}/status`,
    data
  );
  return res.data.data;
}

export async function updateTeacherApplicationNote(
  id: number | string,
  data: { admin_note: string }
): Promise<AdminTeacherApplication> {
  const res = await apiClient.patch<ApiResponse<AdminTeacherApplication>>(
    `/admin/teacher-applications/${id}/note`,
    data
  );
  return res.data.data;
}

export async function bulkUpdateTeacherStatus(data: {
  ids: number[];
  status: string;
  note?: string;
}): Promise<{ message: string; updated_count: number }> {
  const res = await apiClient.post<ApiResponse<{ message: string; updated_count: number }>>(
    '/admin/teacher-applications/bulk-status',
    data
  );
  return res.data.data;
}

export function getTeacherExportUrl(params: TeacherFilterParams = {}): string {
  const searchParams = new URLSearchParams();
  if (params.status) searchParams.set('status', params.status);
  if (params.education_unit_id) searchParams.set('education_unit_id', String(params.education_unit_id));
  return `/api/v1/admin/teacher-applications/export?${searchParams.toString()}`;
}
