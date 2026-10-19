import { apiClient } from '@/lib/api-client';

export const getTeacherApplications = () => apiClient.get('/teacher-applications');
