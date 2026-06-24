import { useRef, useEffect } from 'react';
import { Animated, Easing, Pressable, StyleSheet, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useTheme } from '@/theme/ThemeContext';
import { fontSizes, radii } from '@/theme/tokens';
import { hapticLight } from '@/utils/haptics';

type IconName = keyof typeof Ionicons.glyphMap;

export type TabItemConfig = {
  route: string;
  label: string;
  icon: { default: IconName; focused: IconName };
};

type BottomTabItemProps = {
  config: TabItemConfig;
  isActive: boolean;
  onPress: () => void;
};

export function BottomTabItem({ config, isActive, onPress }: BottomTabItemProps) {
  const { colors } = useTheme();
  const pressScale = useRef(new Animated.Value(1)).current;
  const activeScale = useRef(new Animated.Value(isActive ? 1.06 : 1)).current;

  useEffect(() => {
    Animated.timing(activeScale, {
      toValue: isActive ? 1.06 : 1,
      duration: 200,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start();
  }, [isActive, activeScale]);

  const handlePressIn = () => {
    Animated.timing(pressScale, {
      toValue: 0.94,
      duration: 80,
      useNativeDriver: true,
    }).start();
    hapticLight();
  };

  const handlePressOut = () => {
    Animated.timing(pressScale, {
      toValue: 1,
      duration: 120,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start();
  };

  const iconName = isActive ? config.icon.focused : config.icon.default;
  const iconColor = isActive ? colors.primary : colors.textMuted;
  const labelColor = isActive ? colors.primary : colors.textMuted;

  return (
    <Pressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      accessibilityLabel={config.label}
      accessibilityRole="tab"
      accessibilityState={{ selected: isActive }}
      style={styles.pressable}
    >
      <Animated.View
        style={[
          styles.pill,
          isActive && { backgroundColor: colors.primary + '14' },
          { transform: [{ scale: Animated.multiply(pressScale, activeScale) }] },
        ]}
      >
        <Ionicons name={iconName} size={22} color={iconColor} />
        <Text
          style={[
            styles.label,
            { color: labelColor },
            isActive && { fontWeight: '800' },
          ]}
          numberOfLines={1}
        >
          {config.label}
        </Text>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressable: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  pill: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radii.pill,
    minWidth: 56,
  },
  label: {
    fontSize: fontSizes.xs,
    fontWeight: '600',
  },
});
