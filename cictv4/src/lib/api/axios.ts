import axios from 'axios';
import { safePush } from '@/lib/navigation';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
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
