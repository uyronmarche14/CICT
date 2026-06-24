import { useMutation } from '@tanstack/react-query';

import { adminAuthApi, studentAuthApi } from '@/services/api/auth';
import { useAuthStore } from '@/store/auth-store';
import { normalizeAuthProfile } from '@/utils/auth-profile';

export type LoginActorType = 'student' | 'admin';

type LoginPayload = {
  actorType: LoginActorType;
  identifier: string;
  password: string;
};

export function useLoginMutation() {
  const setSession = useAuthStore((state) => state.setSession);

  return useMutation({
    mutationFn: async ({ actorType, identifier, password }: LoginPayload) => {
      if (actorType === 'admin') {
        return {
          actorType,
          data: await adminAuthApi.login(identifier, password),
        };
      }

      return {
        actorType,
        data: await studentAuthApi.login(identifier, password),
      };
    },
    onSuccess: async (data) => {
      if (data.actorType === 'admin') {
        await setSession({
          actorType: 'admin',
          accessToken: data.data.accessToken,
          refreshToken: data.data.refreshToken,
          profile: normalizeAuthProfile(data.data),
        });
        return;
      }

      await setSession({
        actorType: 'student',
        accessToken: data.data.accessToken,
        refreshToken: data.data.refreshToken,
        student: data.data.student,
      });
    },
  });
}
