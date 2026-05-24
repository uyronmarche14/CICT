import { StyleSheet, Text, View } from 'react-native';

import { useTheme } from '@/theme/ThemeContext';
import { radii, spacing } from '@/theme/tokens';

export function ConnectivityNotice() {
  const { colors, isDark } = useTheme();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: isDark ? '#3a2a1a' : '#FFF4E5',
          borderColor: isDark ? '#5a4a2a' : '#F4D19B',
        },
      ]}
    >
      <Text style={[styles.title, { color: colors.warning }]}>You appear to be offline.</Text>
      <Text style={[styles.description, { color: colors.textMuted }]}>
        Cached data may still be visible, but live student actions need a connection.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderRadius: radii.md,
    padding: spacing.md,
    gap: 4,
  },
  title: {
    fontWeight: '800',
  },
  description: {
    lineHeight: 20,
  },
});
