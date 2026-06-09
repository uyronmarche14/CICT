import { Stack } from 'expo-router';

import { LoadingState } from '@/components/feedback/LoadingState';
import { AppScreen } from '@/components/ui/AppScreen';
import { useAuthBootstrap } from '@/features/auth/useAuthBootstrap';
import { useNotificationSetup, useNotificationResponse } from '@/features/notifications/useNotificationSetup';
import { AppProviders } from '@/providers/AppProviders';

function RootNavigator() {
  const { isHydrating } = useAuthBootstrap();

  useNotificationSetup();
  useNotificationResponse();

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
