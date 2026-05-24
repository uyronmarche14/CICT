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
  const { colors, isDark } = useTheme();

  const variantStyle = useMemo(() => {
    switch (variant) {
      case 'elevated':
        return {
          backgroundColor: colors.surface,
          borderColor: colors.border,
          shadowColor: '#6E29F6',
          shadowOpacity: 0.08,
          shadowRadius: 24,
          shadowOffset: { width: 0, height: 12 },
          elevation: 4,
        };
      case 'glass':
        return {
          backgroundColor: isDark ? 'rgba(30,30,40,0.7)' : 'rgba(255,255,255,0.7)',
          borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.3)',
          shadowOpacity: 0.05,
          shadowRadius: 18,
          elevation: 2,
        };
      default:
        return {
          backgroundColor: colors.surface,
          borderColor: colors.border,
          shadowOpacity: 0.05,
          shadowRadius: 18,
          elevation: 2,
        };
    }
  }, [variant, colors, isDark]);

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
