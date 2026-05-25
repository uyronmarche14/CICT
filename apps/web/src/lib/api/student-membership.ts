import axios from 'axios';
import type { OrganizationMembership } from '@cict/contracts';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const studentApi = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

studentApi.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('student_access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

studentApi.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      try {
        const refreshToken = localStorage.getItem('student_refresh_token');
        if (!refreshToken) throw new Error('No refresh token');
        const { data } = await axios.post(`${API_URL}/student/auth/refresh`, { refreshToken });
        localStorage.setItem('student_access_token', data.data.accessToken);
        localStorage.setItem('student_refresh_token', data.data.refreshToken);
        original.headers.Authorization = `Bearer ${data.data.accessToken}`;
        return studentApi(original);
      } catch {
        localStorage.removeItem('student_access_token');
        localStorage.removeItem('student_refresh_token');
        if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/student/login')) {
          window.location.href = '/student/login';
        }
        return Promise.reject(error);
      }
    }
    return Promise.reject(error);
  }
);

export const studentMembershipAPI = {
  async getMyMemberships() {
    const response = await studentApi.get('/student/memberships');
    return response.data.data.memberships as OrganizationMembership[];
  },

  async applyToOrg(orgId: string, message?: string) {
    const response = await studentApi.post(`/student/organizations/${orgId}/apply`, { message });
    return response.data.data.membership as OrganizationMembership;
  },

  async resignFromOrg(membershipId: string) {
    const response = await studentApi.post(`/student/memberships/${membershipId}/resign`);
    return response.data.data.membership as OrganizationMembership;
  },
};
