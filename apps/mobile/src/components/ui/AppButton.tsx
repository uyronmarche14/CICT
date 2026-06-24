import { PropsWithChildren, useMemo } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, ViewStyle } from 'react-native';

import { useTheme } from '@/theme/ThemeContext';
import { radii, spacing } from '@/theme/tokens';

type AppButtonProps = PropsWithChildren<{
  onPress?: () => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
}>;

export function AppButton({
  children,
  onPress,
  variant = 'primary',
  disabled,
  loading,
  style,
}: AppButtonProps) {
  const { colors } = useTheme();
  const isDisabled = disabled || loading;

  const palette = useMemo(() => {
    switch (variant) {
      case 'primary':
        return { backgroundColor: colors.primary, borderColor: colors.primary, color: colors.primaryForeground };
      case 'secondary':
        return { backgroundColor: colors.surfaceElevated, borderColor: colors.hairline, color: colors.text };
      case 'ghost':
        return { backgroundColor: 'transparent', borderColor: 'transparent', color: colors.primary };
      case 'danger':
        return { backgroundColor: colors.danger, borderColor: colors.danger, color: colors.primaryForeground };
    }
  }, [variant, colors]);

  return (
    <Pressable
      disabled={isDisabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        {
          backgroundColor: palette.backgroundColor,
          borderColor: palette.borderColor,
          opacity: isDisabled ? 0.5 : pressed ? 0.92 : 1,
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={palette.color} />
      ) : (
        <Text style={[styles.label, { color: palette.color }]}>{children}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 50,
    borderRadius: radii.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
  },
  label: {
    fontSize: 16,
    fontWeight: '700',
  },
});
