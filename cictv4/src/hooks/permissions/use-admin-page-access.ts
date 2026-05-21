'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export const useAdminPageAccess = (
  isAllowed: boolean,
  redirectTo = '/admin/dashboard'
) => {
  const { loading, isAuthenticated, canAccessAdmin } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) {
      return;
    }

    if (!isAuthenticated) {
      router.replace('/admin/login');
      return;
    }

    if (!canAccessAdmin) {
      router.replace('/');
      return;
    }

    if (!isAllowed) {
      router.replace(redirectTo);
    }
  }, [canAccessAdmin, isAllowed, isAuthenticated, loading, redirectTo, router]);

  return {
    isCheckingAccess: loading,
    shouldRender: !loading && isAuthenticated && canAccessAdmin && isAllowed,
  };
};
