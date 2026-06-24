import { StyleSheet, Text, View } from 'react-native';

import { useTheme } from '@/theme/ThemeContext';
import { fontSizes, radii, spacing } from '@/theme/tokens';
import { Ionicons } from '@expo/vector-icons';

export function CacheIndicator() {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.surfaceMuted, borderColor: colors.border }]}>
      <Ionicons name="cloud-offline-outline" size={14} color={colors.warning} />
      <Text style={[styles.text, { color: colors.textMuted }]}>
        Showing cached data
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radii.sm,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: fontSizes.xs,
    fontWeight: '600',
  },
});
