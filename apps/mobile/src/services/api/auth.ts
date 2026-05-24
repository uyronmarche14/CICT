import { client } from '@/services/api/client';
import type { StudentLoginResponse, StudentProfileResponse } from '@/types/api';

export const authApi = {
  async login(identifier: string, password: string) {
    const response = await client.post<{ success: boolean; data: StudentLoginResponse }>(
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
    const response = await client.get<{ success: boolean; data: StudentProfileResponse }>(
      '/student/profile'
    );

    return response.data.data.student;
  },
};
