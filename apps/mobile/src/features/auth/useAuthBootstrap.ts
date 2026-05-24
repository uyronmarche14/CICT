import { useEffect } from 'react';

import { authApi } from '@/services/api/auth';
import { sessionStorage } from '@/services/storage/secure-store';
import { useAuthStore } from '@/store/auth-store';

export function useAuthBootstrap() {
  const status = useAuthStore((state) => state.status);
  const setHydrating = useAuthStore((state) => state.setHydrating);
  const setSession = useAuthStore((state) => state.setSession);
  const clearSession = useAuthStore((state) => state.clearSession);

  useEffect(() => {
    let isMounted = true;

    const bootstrap = async () => {
      setHydrating();

      const tokens = await sessionStorage.getTokens();

      if (!tokens) {
        if (isMounted) {
          await clearSession();
        }
        return;
      }

      try {
        const student = await authApi.me();
        if (isMounted) {
          await setSession({ ...tokens, student });
        }
      } catch {
        if (isMounted) {
          await clearSession();
        }
      }
    };

    void bootstrap();

    return () => {
      isMounted = false;
    };
  }, [clearSession, setHydrating, setSession]);

  return {
    isHydrating: status === 'hydrating',
  };
}
