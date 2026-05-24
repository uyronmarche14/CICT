import { useMutation } from '@tanstack/react-query';

import { authApi } from '@/services/api/auth';
import { useAuthStore } from '@/store/auth-store';

export function useLogout() {
  const refreshToken = useAuthStore((state) => state.refreshToken);
  const clearSession = useAuthStore((state) => state.clearSession);

  return useMutation({
    mutationFn: async () => {
      await authApi.logout(refreshToken);
    },
    onSettled: async () => {
      await clearSession();
    },
  });
}
