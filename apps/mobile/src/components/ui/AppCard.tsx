import { PropsWithChildren, useMemo } from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';

import { useTheme } from '@/theme/ThemeContext';
import { radii, spacing } from '@/theme/tokens';

type CardVariant = 'default' | 'elevated' | 'glass';

export function AppCard({
  children,
  style,
  variant = 'default',
}: PropsWithChildren<{ style?: ViewStyle; variant?: CardVariant }>) {
  const { colors } = useTheme();

  const variantStyle = useMemo(() => {
    switch (variant) {
      case 'elevated':
        return {
          backgroundColor: colors.surfaceElevated,
          borderColor: colors.hairline,
          shadowColor: colors.shadow,
          shadowOpacity: 0.08,
          shadowRadius: 22,
          shadowOffset: { width: 0, height: 10 },
          elevation: 3,
        };
      case 'glass':
        return {
          backgroundColor: colors.surfaceSoft,
          borderColor: colors.hairline,
          shadowColor: colors.shadow,
          shadowOpacity: 0.04,
          shadowRadius: 16,
          elevation: 1,
        };
      default:
        return {
          backgroundColor: colors.surfaceElevated,
          borderColor: colors.hairline,
          shadowColor: colors.shadow,
          shadowOpacity: 0.05,
          shadowRadius: 16,
          elevation: 2,
        };
    }
  }, [variant, colors]);

  return <View style={[styles.base, variantStyle, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radii.lg,
    borderWidth: 1,
    padding: spacing.lg,
    gap: spacing.sm,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 10 },
  },
});
