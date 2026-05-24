import axios from 'axios';
import type {
  AttendanceLog,
  StudentEvent,
  StudentLoginResponse,
  StudentProfile,
  StudentQrPayload,
  StudentRegistration,
} from '@cict/contracts';

export type { AttendanceLog, StudentEvent, StudentRegistration };

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

export const studentAuthAPI = {
  login: async (studentNumber: string, password: string) => {
    const { data } = await axios.post(`${API_URL}/student/auth/login`, { identifier: studentNumber, password });
    return data.data as StudentLoginResponse;
  },
  logout: async () => {
    const refreshToken = localStorage.getItem('student_refresh_token');
    await studentApi.post('/student/auth/logout', { refreshToken });
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
