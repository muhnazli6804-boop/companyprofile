import { apiClient } from '@/lib/api-client';
import type { LoginFormData } from './schemas';

export const login = (data: LoginFormData) => apiClient.post('/auth/login', data);
export const logout = () => apiClient.post('/auth/logout');
export const getCurrentUser = () => apiClient.get('/auth/me');
