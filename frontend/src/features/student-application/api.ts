import { apiClient } from '@/lib/api-client';

export const getStudentApplications = () => apiClient.get('/student-applications');
export const getStudentApplication = (id: number) => apiClient.get('/student-applications/' + id);
