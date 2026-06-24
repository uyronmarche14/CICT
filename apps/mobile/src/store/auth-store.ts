import { create } from 'zustand';

import type { AuthProfile, MobileSession } from '@/types/api';
import type { StudentProfile } from '@/types/models';
import { sessionStorage } from '@/services/storage/secure-store';

type AuthStatus = 'hydrating' | 'anonymous' | 'authenticated';
type ActorType = MobileSession['actorType'];

type AuthState = {
  accessToken: string | null;
  refreshToken: string | null;
  actorType: ActorType | null;
  student: StudentProfile | null;
  adminProfile: AuthProfile | null;
  session: MobileSession | null;
  status: AuthStatus;
  setHydrating: () => void;
  setSession: (payload: MobileSession) => Promise<void>;
  updateStudent: (student: StudentProfile | null) => void;
  updateAdminProfile: (profile: AuthProfile | null) => void;
  clearSession: () => Promise<void>;
};

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  refreshToken: null,
  actorType: null,
  student: null,
  adminProfile: null,
  session: null,
  status: 'hydrating',
  setHydrating: () => set({ status: 'hydrating' }),
  setSession: async (session) => {
    await sessionStorage.saveSession(session);
    await sessionStorage.saveTokens({
      accessToken: session.accessToken,
      refreshToken: session.refreshToken,
    });
    set({
      accessToken: session.accessToken,
      refreshToken: session.refreshToken,
      actorType: session.actorType,
      student: session.actorType === 'student' ? session.student : null,
      adminProfile: session.actorType === 'admin' ? session.profile : null,
      session,
      status: 'authenticated',
    });
  },
  updateStudent: (student) =>
    set((state) => ({
      student,
      session:
        student && state.session?.actorType === 'student'
          ? { ...state.session, student }
          : state.session,
      status: student ? 'authenticated' : state.status,
    })),
  updateAdminProfile: (profile) =>
    set((state) => ({
      adminProfile: profile,
      session:
        profile && state.session?.actorType === 'admin'
          ? { ...state.session, profile }
          : state.session,
      status: profile ? 'authenticated' : state.status,
    })),
  clearSession: async () => {
    await sessionStorage.clear();
    set({
      accessToken: null,
      refreshToken: null,
      actorType: null,
      student: null,
      adminProfile: null,
      session: null,
      status: 'anonymous',
    });
  },
}));
