import api from '@/lib/api/axios';
import type { AuthProfile } from '@/types';

export const adminAuthFeatureAPI = {
  login: async (payload: { email: string; password: string }) => {
    const response = await api.post<{ success: boolean; data: AuthProfile }>(
      '/auth/login',
      payload
    );
    return response.data.data;
  },
};
