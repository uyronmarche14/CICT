import { Redirect, Tabs, usePathname, useRouter } from 'expo-router';
import { View } from 'react-native';

import { BottomTabBar } from '@/components/navigation/bottom-tab-bar';
import type { TabItemConfig } from '@/components/navigation/bottom-tab-item';
import { useAuthStore } from '@/store/auth-store';
import type { MobileAdminTabKey } from '@/utils/admin-access';
import { canUseAdminTab } from '@/utils/admin-access';

const ADMIN_TABS: TabItemConfig[] = [
  { route: 'dashboard', label: 'Dashboard', icon: { default: 'grid-outline', focused: 'grid' } },
  { route: 'scanner', label: 'Scanner', icon: { default: 'camera-outline', focused: 'camera' } },
  { route: 'events', label: 'Events', icon: { default: 'calendar-outline', focused: 'calendar' } },
  { route: 'settings', label: 'Settings', icon: { default: 'settings-outline', focused: 'settings' } },
];

function resolveActiveTab(pathname: string): string {
  const segments = pathname.replace(/^\//, '').split('/');
  for (const tab of ADMIN_TABS) {
    if (segments.includes(tab.route)) return tab.route;
  }
  return 'dashboard';
}

const ADMIN_ROUTES = {
  dashboard: '/(admin)/dashboard',
  scanner: '/(admin)/scanner',
  events: '/(admin)/events',
  settings: '/(admin)/settings',
} as const;

export default function AdminLayout() {
  const accessToken = useAuthStore((state) => state.accessToken);
  const actorType = useAuthStore((state) => state.actorType);
  const adminProfile = useAuthStore((state) => state.adminProfile);
  const pathname = usePathname();
  const router = useRouter();

  if (!accessToken) {
    return <Redirect href="/(auth)/login" />;
  }

  if (actorType !== 'admin') {
    return <Redirect href="/(tabs)/home" />;
  }

  const canUse = (tab: MobileAdminTabKey) => canUseAdminTab(adminProfile, tab);
  const visibleTabs = ADMIN_TABS.filter((tab) => canUse(tab.route as MobileAdminTabKey));

  return (
    <View style={{ flex: 1 }}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: { display: 'none' },
        }}
      >
        <Tabs.Screen
          name="dashboard"
          options={{ href: canUse('dashboard') ? undefined : null }}
        />
        <Tabs.Screen
          name="scanner"
          options={{ href: canUse('scanner') ? undefined : null }}
        />
        <Tabs.Screen
          name="events"
          options={{ href: canUse('events') ? undefined : null }}
        />
        <Tabs.Screen name="settings" />
        <Tabs.Screen
          name="approvals"
          options={{ tabBarButton: () => null, href: canUse('approvals') ? undefined : null }}
        />
        <Tabs.Screen
          name="students"
          options={{ tabBarButton: () => null, href: canUse('students') ? undefined : null }}
        />
        <Tabs.Screen
          name="organizations"
          options={{ tabBarButton: () => null, href: canUse('organizations') ? undefined : null }}
        />
      </Tabs>
      <BottomTabBar
        tabs={visibleTabs}
        activeRoute={resolveActiveTab(pathname)}
        onTabPress={(route) => router.push(ADMIN_ROUTES[route as keyof typeof ADMIN_ROUTES])}
      />
    </View>
  );
}
