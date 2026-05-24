import { create } from 'zustand';

import type { AuthTokens } from '@/types/api';
import type { StudentProfile } from '@/types/models';
import { sessionStorage } from '@/services/storage/secure-store';

type AuthStatus = 'hydrating' | 'anonymous' | 'authenticated';

type AuthState = {
  accessToken: string | null;
  refreshToken: string | null;
  student: StudentProfile | null;
  status: AuthStatus;
  setHydrating: () => void;
  setSession: (payload: AuthTokens & { student: StudentProfile | null }) => Promise<void>;
  updateStudent: (student: StudentProfile | null) => void;
  clearSession: () => Promise<void>;
};

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  refreshToken: null,
  student: null,
  status: 'hydrating',
  setHydrating: () => set({ status: 'hydrating' }),
  setSession: async ({ accessToken, refreshToken, student }) => {
    await sessionStorage.saveTokens({ accessToken, refreshToken });
    set({
      accessToken,
      refreshToken,
      student,
      status: 'authenticated',
    });
  },
  updateStudent: (student) =>
    set((state) => ({
      student,
      status: student ? 'authenticated' : state.status,
    })),
  clearSession: async () => {
    await sessionStorage.clear();
    set({
      accessToken: null,
      refreshToken: null,
      student: null,
      status: 'anonymous',
    });
  },
}));
