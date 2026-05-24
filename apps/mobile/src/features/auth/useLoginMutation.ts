import { useMutation } from '@tanstack/react-query';

import { authApi } from '@/services/api/auth';
import { useAuthStore } from '@/store/auth-store';

export function useLoginMutation() {
  const setSession = useAuthStore((state) => state.setSession);

  return useMutation({
    mutationFn: async ({
      identifier,
      password,
    }: {
      identifier: string;
      password: string;
    }) => authApi.login(identifier, password),
    onSuccess: async (data) => {
      await setSession({
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        student: data.student,
      });
    },
  });
}
