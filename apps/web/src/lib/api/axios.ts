import axios from 'axios';
import { safePush } from '@/lib/navigation';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  xsrfCookieName: 'csrf_token',
  xsrfHeaderName: 'X-CSRF-Token',
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  if (typeof FormData !== 'undefined' && config.data instanceof FormData && config.headers) {
    config.headers.delete('Content-Type');
  }

  return config;
});

let refreshPromise: Promise<boolean> | null = null;

async function refreshAccessToken(): Promise<boolean> {
  try {
    const { data } = await axios.post(
      `${api.defaults.baseURL}/auth/refresh`,
      {},
      { withCredentials: true }
    );
    return data.success === true;
  } catch {
    return false;
  }
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        if (!refreshPromise) {
          refreshPromise = refreshAccessToken();
        }
        const refreshed = await refreshPromise;
        refreshPromise = null;
        if (refreshed) return api(originalRequest);
      } catch {
        refreshPromise = null;
      }
    }

    const shouldForceAdminLogout =
      error.response?.status === 401 ||
      (error.response?.status === 403 &&
        ['Your account has been deactivated', 'User no longer exists', 'Your assigned role is no longer valid'].includes(
          error.response?.data?.message
        ));

    if (shouldForceAdminLogout) {
      if (
        typeof window !== 'undefined' &&
        window.location.pathname.startsWith('/admin') &&
        window.location.pathname !== '/admin/login'
      ) {
        safePush('/admin/login');
      }
    }
    return Promise.reject(error);
  }
);

export default api;
