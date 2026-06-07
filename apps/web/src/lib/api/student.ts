import axios from 'axios';
import type {
  AttendanceLog,
  StudentEvent,
  StudentLoginResponse,
  OrganizationMembership,
  StudentProfile,
  StudentQrPayload,
  StudentRegistration,
} from '@cict/contracts';

export type { AttendanceLog, StudentEvent, StudentRegistration };

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

const studentApi = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  xsrfCookieName: 'csrf_token',
  xsrfHeaderName: 'X-CSRF-Token',
  headers: { 'Content-Type': 'application/json' },
});

studentApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      // Only redirect student pages — don't hijack admin or public routes
      if (
        window.location.pathname.startsWith('/student') &&
        !window.location.pathname.startsWith('/student/login')
      ) {
        window.location.href = '/student/login';
      }
    }
    return Promise.reject(error);
  }
);

export const studentAuthAPI = {
  login: async (studentNumber: string, password: string) => {
    const { data } = await axios.post(
      `${API_URL}/student/auth/login`,
      { identifier: studentNumber, password },
      { withCredentials: true }
    );
    return data.data as StudentLoginResponse;
  },
  logout: async () => {
    await studentApi.post('/student/auth/logout');
  },
  me: async () => {
    const { data } = await studentApi.get('/student/profile');
    return data.data.student as StudentProfile;
  },
};

export const studentEventAPI = {
  getEligibleEvents: async () => {
    const { data } = await studentApi.get('/student/events');
    return data.data.events as StudentEvent[];
  },
  getRegistration: async (eventId: string) => {
    const { data } = await studentApi.get(`/student/events/${eventId}/registration`);
    return data.data.registration as StudentRegistration | null;
  },
  register: async (eventId: string) => {
    const { data } = await studentApi.post(`/student/events/${eventId}/register`);
    return data.data.registration as StudentRegistration;
  },
  cancelRegistration: async (eventId: string) => {
    const { data } = await studentApi.post(`/student/events/${eventId}/cancel-registration`);
    return data.data.registration as StudentRegistration;
  },
  getQrPayload: async (eventId: string) => {
    const { data } = await studentApi.get(`/student/events/${eventId}/qr`);
    return data.data as StudentQrPayload;
  },
};

export const studentRegistrationAPI = {
  getAll: async () => {
    const { data } = await studentApi.get('/student/registrations');
    return data.data.registrations as StudentRegistration[];
  },
  getAttendanceHistory: async () => {
    const { data } = await studentApi.get('/student/attendance/history');
    return data.data.attendanceLogs as AttendanceLog[];
  },
};

export const studentMembershipAPI = {
  getMyMemberships: async () => {
    const { data } = await studentApi.get('/student/memberships');
    return data.data.memberships as OrganizationMembership[];
  },
  applyToOrg: async (orgId: string, message?: string) => {
    const { data } = await studentApi.post(`/student/organizations/${orgId}/apply`, { message });
    return data.data.membership as OrganizationMembership;
  },
  resignFromOrg: async (membershipId: string) => {
    const { data } = await studentApi.post(`/student/memberships/${membershipId}/resign`);
    return data.data.membership as OrganizationMembership;
  },
};
