import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BottomTabItem, type TabItemConfig } from '@/components/navigation/bottom-tab-item';
import { useTheme } from '@/theme/ThemeContext';
import { radii, spacing } from '@/theme/tokens';

type BottomTabBarProps = {
  tabs: TabItemConfig[];
  activeRoute: string;
  onTabPress: (route: string) => void;
};

export function BottomTabBar({ tabs, activeRoute, onTabPress }: BottomTabBarProps) {
  const { colors } = useTheme();
  const { bottom } = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.surface,
          shadowColor: colors.shadow,
          paddingBottom: bottom > 0 ? bottom - 4 : 8,
        },
      ]}
    >
      <View style={styles.row}>
        {tabs.map((tab) => (
          <BottomTabItem
            key={tab.route}
            config={tab}
            isActive={activeRoute === tab.route}
            onPress={() => onTabPress(tab.route)}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: spacing.sm,
    paddingTop: spacing.xs,
    borderTopLeftRadius: radii.xl,
    borderTopRightRadius: radii.xl,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 6,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
});
