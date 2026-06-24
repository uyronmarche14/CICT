import { Redirect } from 'expo-router';

import { useAuthStore } from '@/store/auth-store';
import { getDefaultAdminRoute } from '@/utils/auth-profile';

export default function IndexRoute() {
  const accessToken = useAuthStore((state) => state.accessToken);
  const actorType = useAuthStore((state) => state.actorType);
  const adminProfile = useAuthStore((state) => state.adminProfile);

  if (accessToken && actorType === 'student') {
    return <Redirect href="/(tabs)/home" />;
  }

  if (accessToken && actorType === 'admin') {
    return <Redirect href={getDefaultAdminRoute(adminProfile) as never} />;
  }

  return <Redirect href="/(auth)/login" />;
}
