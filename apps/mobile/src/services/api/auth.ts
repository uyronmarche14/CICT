import { client } from '@/services/api/client';
import type {
  AdminLoginResponse,
  AuthProfile,
  StudentLoginResponse,
  StudentProfileResponse,
} from '@/types/api';

type ApiResponse<T> = {
  success: boolean;
  data: T;
};

export const studentAuthApi = {
  async login(identifier: string, password: string) {
    const response = await client.post<ApiResponse<StudentLoginResponse>>(
      '/student/auth/login',
      {
        identifier,
        password,
        platform: 'expo-mobile',
        deviceLabel: 'CICT Mobile',
      }
    );

    return response.data.data;
  },

  async logout(refreshToken?: string | null) {
    await client.post('/student/auth/logout', {
      refreshToken,
    });
  },

  async me() {
    const response = await client.get<ApiResponse<StudentProfileResponse>>('/student/profile');

    return response.data.data.student;
  },

  async register(payload: {
    firstName: string;
    lastName: string;
    studentNumber: string;
    email: string;
    programId: string;
    yearLevelId: string;
    sectionId: string;
    password: string;
  }) {
    const response = await client.post<ApiResponse<{ success: boolean }>>('/student/auth/register', payload);

    return response.data;
  },
};

export const adminAuthApi = {
  async login(email: string, password: string) {
    const response = await client.post<ApiResponse<AdminLoginResponse>>('/auth/login', {
      email,
      password,
    });

    return response.data.data;
  },

  async logout(refreshToken?: string | null) {
    await client.post('/auth/logout', {
      refreshToken,
    });
  },

  async me() {
    const response = await client.get<ApiResponse<AuthProfile>>('/auth/profile');

    return response.data.data;
  },
};

export const studentAuthApiExtended = {
  register(payload: {
    firstName: string;
    lastName: string;
    studentNumber: string;
    email: string;
    programId: string;
    yearLevelId: string;
    section: string;
    password: string;
  }) {
    return client.post('/student/auth/register', payload);
  },
  forgotPassword(identifier: string) {
    return client.post('/student/auth/forgot-password', { identifier });
  },
};

export const authApi = studentAuthApi;
