import { apiClient } from '@/lib/api-client';

export const getPublicSettings = () => apiClient.get('/public/settings');
export const getPublicUnits = () => apiClient.get('/public/units');
export const getPublicPosts = () => apiClient.get('/public/posts');
export const getRegistrationInfo = () => apiClient.get('/public/registration-info');
