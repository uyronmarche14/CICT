import { Redirect } from 'expo-router';

import { useAuthStore } from '@/store/auth-store';

export default function IndexRoute() {
  const accessToken = useAuthStore((state) => state.accessToken);

  if (accessToken) {
    return <Redirect href="/(tabs)/home" />;
  }

  return <Redirect href="/(auth)/login" />;
}
