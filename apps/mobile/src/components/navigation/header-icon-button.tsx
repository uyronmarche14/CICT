import { useRef } from 'react';
import { Animated, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useTheme } from '@/theme/ThemeContext';
import { radii } from '@/theme/tokens';
import { hapticLight } from '@/utils/haptics';

type IconName = keyof typeof Ionicons.glyphMap;

type HeaderIconButtonProps = {
  icon: IconName;
  accessibilityLabel: string;
  onPress: () => void;
  badge?: boolean;
  badgeColor?: string;
};

export function HeaderIconButton({
  icon,
  accessibilityLabel,
  onPress,
  badge,
  badgeColor,
}: HeaderIconButtonProps) {
  const { colors } = useTheme();
  const scale = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scale, {
      toValue: 0.92,
      useNativeDriver: true,
      speed: 50,
      bounciness: 4,
    }).start();
    hapticLight();
  };

  const handlePressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      speed: 50,
      bounciness: 4,
    }).start();
  };

  return (
    <Pressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
    >
      <Animated.View
        style={[
          styles.button,
          {
            backgroundColor: colors.surface,
            shadowColor: colors.shadow,
            borderColor: colors.hairline,
            transform: [{ scale }],
          },
        ]}
      >
        <Ionicons name={icon} size={22} color={colors.primary} />
        {badge ? (
          <Animated.View
            style={[
              styles.badge,
              { backgroundColor: badgeColor ?? colors.danger },
            ]}
          />
        ) : null}
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  badge: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 10,
    height: 10,
    borderRadius: radii.pill,
  },
});
