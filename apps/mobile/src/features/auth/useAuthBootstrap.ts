import { useEffect } from 'react';

import { adminAuthApi, studentAuthApi } from '@/services/api/auth';
import { sessionStorage } from '@/services/storage/secure-store';
import { useAuthStore } from '@/store/auth-store';
import { normalizeAuthProfile } from '@/utils/auth-profile';

export function useAuthBootstrap() {
  const status = useAuthStore((state) => state.status);
  const setHydrating = useAuthStore((state) => state.setHydrating);
  const setSession = useAuthStore((state) => state.setSession);
  const clearSession = useAuthStore((state) => state.clearSession);

  useEffect(() => {
    let isMounted = true;

    const bootstrap = async () => {
      setHydrating();

      const session = await sessionStorage.getSession();

      if (session) {
        try {
          if (session.actorType === 'admin') {
            const profile = await adminAuthApi.me();
            if (isMounted) {
              await setSession({ ...session, profile: normalizeAuthProfile(profile, session.profile) });
            }
          } else {
            const student = await studentAuthApi.me();
            if (isMounted) {
              await setSession({ ...session, student });
            }
          }
        } catch {
          if (isMounted) {
            await clearSession();
          }
        }
        return;
      }

      const legacyTokens = await sessionStorage.getTokens();

      if (!legacyTokens) {
        if (isMounted) {
          await clearSession();
        }
        return;
      }

      try {
        const student = await studentAuthApi.me();
        if (isMounted) {
          await setSession({ ...legacyTokens, actorType: 'student', student });
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
