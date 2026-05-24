import axios from 'axios';

import { env } from '@/config/env';
import { sessionStorage } from '@/services/storage/secure-store';
import { useAuthStore } from '@/store/auth-store';

const client = axios.create({
  baseURL: env.apiUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});

let refreshPromise: Promise<string | null> | null = null;

const createRefreshClient = () =>
  axios.create({
    baseURL: env.apiUrl,
    headers: {
      'Content-Type': 'application/json',
    },
  });

client.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers.set('Authorization', `Bearer ${token}`);
  }
  return config;
});

client.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as typeof error.config & { _retry?: boolean };

    if (error.response?.status !== 401 || originalRequest?._retry) {
      return Promise.reject(error);
    }

    const refreshToken = useAuthStore.getState().refreshToken;
    if (!refreshToken) {
      await useAuthStore.getState().clearSession();
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    if (!refreshPromise) {
      refreshPromise = (async () => {
        try {
          const refreshClient = createRefreshClient();
          const response = await refreshClient.post('/student/auth/refresh', {
            refreshToken,
          });

          const nextAccessToken = response.data.data.accessToken as string;
          const nextRefreshToken = response.data.data.refreshToken as string;
          const student = response.data.data.student ?? useAuthStore.getState().student;

          await useAuthStore.getState().setSession({
            accessToken: nextAccessToken,
            refreshToken: nextRefreshToken,
            student,
          });

          return nextAccessToken;
        } catch (refreshError) {
          await sessionStorage.clear();
          await useAuthStore.getState().clearSession();
          throw refreshError;
        } finally {
          refreshPromise = null;
        }
      })();
    }

    const nextAccessToken = await refreshPromise;
    if (!nextAccessToken) {
      return Promise.reject(error);
    }

    originalRequest.headers.set('Authorization', `Bearer ${nextAccessToken}`);
    return client(originalRequest);
  }
);

export { client };
