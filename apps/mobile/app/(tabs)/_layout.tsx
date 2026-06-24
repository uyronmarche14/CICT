import { Redirect, Tabs, usePathname, useRouter } from 'expo-router';
import { View } from 'react-native';

import { BottomTabBar } from '@/components/navigation/bottom-tab-bar';
import type { TabItemConfig } from '@/components/navigation/bottom-tab-item';
import { useAuthStore } from '@/store/auth-store';

const STUDENT_TABS: TabItemConfig[] = [
  { route: 'home', label: 'Home', icon: { default: 'home-outline', focused: 'home' } },
  { route: 'updates', label: 'Announcements', icon: { default: 'megaphone-outline', focused: 'megaphone' } },
  { route: 'qr', label: 'QR', icon: { default: 'qr-code-outline', focused: 'qr-code' } },
  { route: 'events', label: 'Events', icon: { default: 'calendar-outline', focused: 'calendar' } },
  { route: 'profile', label: 'Profile', icon: { default: 'person-outline', focused: 'person' } },
];

function resolveActiveTab(pathname: string): string {
  const segments = pathname.replace(/^\//, '').split('/');
  for (const tab of STUDENT_TABS) {
    if (segments.includes(tab.route)) return tab.route;
  }
  return 'home';
}

const STUDENT_ROUTES = {
  home: '/(tabs)/home',
  updates: '/(tabs)/updates',
  qr: '/(tabs)/qr',
  events: '/(tabs)/events',
  profile: '/(tabs)/profile',
} as const;

export default function TabLayout() {
  const accessToken = useAuthStore((state) => state.accessToken);
  const actorType = useAuthStore((state) => state.actorType);
  const pathname = usePathname();
  const router = useRouter();

  if (!accessToken) {
    return <Redirect href="/(auth)/login" />;
  }

  if (actorType !== 'student') {
    return <Redirect href="/(admin)/dashboard" />;
  }

  return (
    <View style={{ flex: 1 }}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: { display: 'none' },
        }}
      >
        <Tabs.Screen name="home" />
        <Tabs.Screen name="updates" />
        <Tabs.Screen name="qr" />
        <Tabs.Screen name="events" />
        <Tabs.Screen name="profile" />
        <Tabs.Screen name="orgs" options={{ tabBarButton: () => null }} />
        <Tabs.Screen name="settings" options={{ tabBarButton: () => null }} />
      </Tabs>
      <BottomTabBar
        tabs={STUDENT_TABS}
        activeRoute={resolveActiveTab(pathname)}
        onTabPress={(route) => router.push(STUDENT_ROUTES[route as keyof typeof STUDENT_ROUTES])}
      />
    </View>
  );
}
