import { StyleSheet, Text, View } from 'react-native';

import { useTheme } from '@/theme/ThemeContext';
import { fontSizes } from '@/theme/tokens';

export function SectionHeader({
  title,
  subtitle,
  branded,
}: {
  title: string;
  subtitle?: string;
  branded?: boolean;
}) {
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: colors.text }, branded && { fontFamily: 'Blockletter', fontSize: fontSizes.xl, letterSpacing: 0.05, textTransform: 'uppercase', color: colors.primary }]}>
        {title}
      </Text>
      {subtitle ? <Text style={[styles.subtitle, { color: colors.textMuted }]}>{subtitle}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 4,
  },
  title: {
    fontSize: fontSizes.lg,
    fontWeight: '800',
  },
  subtitle: {
    fontSize: fontSizes.sm,
  },
});
