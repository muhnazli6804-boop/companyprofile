import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { env } from './env';
import type { ApiError } from '@/types';

// TODO: see ARCHITECTURE.md section 6.3 & Rancangan-API-Padindi.md section 2.1
export const apiClient = axios.create({
  baseURL: env.VITE_API_BASE_URL,
  withCredentials: true,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
});

let isRefreshingCsrf = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: Error | null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve();
    }
  });
  failedQueue = [];
};

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiError>) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (!error.response) {
      return Promise.reject(error);
    }

    const { status } = error.response;

    // 419: CSRF token mismatch / expired -> refresh CSRF cookie and retry once
    if (status === 419 && originalRequest && !originalRequest._retry) {
      if (isRefreshingCsrf) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => apiClient(originalRequest))
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshingCsrf = true;

      try {
        await axios.get('/sanctum/csrf-cookie', { withCredentials: true });
        processQueue(null);
        return apiClient(originalRequest);
      } catch (csrfError) {
        processQueue(csrfError as Error);
        return Promise.reject(csrfError);
      } finally {
        isRefreshingCsrf = false;
      }
    }

    return Promise.reject(error);
  }
);
