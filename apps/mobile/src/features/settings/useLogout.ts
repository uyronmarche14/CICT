import { useMutation } from '@tanstack/react-query';

import { adminAuthApi, studentAuthApi } from '@/services/api/auth';
import { useAuthStore } from '@/store/auth-store';

export function useLogout() {
  const refreshToken = useAuthStore((state) => state.refreshToken);
  const actorType = useAuthStore((state) => state.actorType);
  const clearSession = useAuthStore((state) => state.clearSession);

  return useMutation({
    mutationFn: async () => {
      if (actorType === 'admin') {
        await adminAuthApi.logout(refreshToken);
        return;
      }

      await studentAuthApi.logout(refreshToken);
    },
    onSettled: async () => {
      await clearSession();
    },
  });
}
