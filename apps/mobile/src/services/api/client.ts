import { create } from 'axios';

import { env } from '@/config/env';
import { sessionStorage } from '@/services/storage/secure-store';
import { useAuthStore } from '@/store/auth-store';
import { normalizeAuthProfile } from '@/utils/auth-profile';

const client = create({
  baseURL: env.apiUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});

let refreshPromise: Promise<string | null> | null = null;

const createRefreshClient = () =>
  create({
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

    const state = useAuthStore.getState();
    const { actorType, refreshToken } = state;
    if (!actorType || !refreshToken) {
      await useAuthStore.getState().clearSession();
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    if (!refreshPromise) {
      refreshPromise = (async () => {
        try {
          const refreshClient = createRefreshClient();
          const refreshPath =
            useAuthStore.getState().actorType === 'admin'
              ? '/auth/refresh'
              : '/student/auth/refresh';
          const response = await refreshClient.post(refreshPath, {
            refreshToken,
          });

          const data = response.data.data;
          const nextAccessToken = data.accessToken as string;
          const nextRefreshToken = (data.refreshToken as string) ?? refreshToken;
          const currentState = useAuthStore.getState();

          if (currentState.actorType === 'admin') {
            await currentState.setSession({
              actorType: 'admin',
              accessToken: nextAccessToken,
              refreshToken: nextRefreshToken,
              profile: normalizeAuthProfile(data, currentState.adminProfile),
            });
          } else {
            await currentState.setSession({
              actorType: 'student',
              accessToken: nextAccessToken,
              refreshToken: nextRefreshToken,
              student: data.student ?? currentState.student,
            });
          }

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
