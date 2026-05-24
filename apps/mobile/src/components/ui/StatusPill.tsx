import { StyleSheet, Text, View } from 'react-native';

import { useTheme } from '@/theme/ThemeContext';
import { fontSizes, radii, spacing } from '@/theme/tokens';

export function StatusPill({
  label,
  tone = 'neutral',
}: {
  label: string;
  tone?: 'success' | 'warning' | 'info' | 'neutral' | 'danger';
}) {
  const { colors, isDark } = useTheme();

  const palette = (() => {
    switch (tone) {
      case 'success':
        return { backgroundColor: isDark ? '#1a3a2a' : '#E8F7EE', color: colors.success };
      case 'warning':
        return { backgroundColor: isDark ? '#3a2a1a' : '#FFF4E5', color: '#B06700' };
      case 'info':
        return { backgroundColor: isDark ? '#2a1a3a' : '#EDE9FE', color: colors.primary };
      case 'danger':
        return { backgroundColor: isDark ? '#3a1a1a' : '#FDECEC', color: colors.danger };
      case 'neutral':
      default:
        return { backgroundColor: colors.surfaceMuted, color: colors.textMuted };
    }
  })();

  return (
    <View style={[styles.pill, { backgroundColor: palette.backgroundColor }]}>
      <Text style={[styles.label, { color: palette.color }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: radii.pill,
  },
  label: {
    fontSize: fontSizes.xs,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
});
