import { Stack, useRouter, useSegments } from 'expo-router';
import { useEffect } from 'react';

import { LoadingState } from '@/components/feedback/LoadingState';
import { AppScreen } from '@/components/ui/AppScreen';
import { useAuthBootstrap } from '@/features/auth/useAuthBootstrap';
import { useNotificationSetup, useNotificationResponse } from '@/features/notifications/useNotificationSetup';
import { AppProviders } from '@/providers/AppProviders';
import { useAuthStore } from '@/store/auth-store';

function RootNavigator() {
  const { isHydrating } = useAuthBootstrap();
  const accessToken = useAuthStore((state) => state.accessToken);
  const segments = useSegments();
  const router = useRouter();

  useNotificationSetup();
  useNotificationResponse();

  const inAuthGroup = segments[0] === '(auth)';

  useEffect(() => {
    if (isHydrating) {
      return;
    }

    if (!accessToken && !inAuthGroup) {
      router.replace('/(auth)/login');
      return;
    }

    if (accessToken && inAuthGroup) {
      router.replace('/(tabs)/home');
    }
  }, [accessToken, isHydrating, router, segments]);

  if (isHydrating) {
    return (
      <AppScreen scroll={false}>
        <LoadingState label="Restoring your session..." />
      </AppScreen>
    );
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}

export default function RootLayout() {
  return (
    <AppProviders>
      <RootNavigator />
    </AppProviders>
  );
}
