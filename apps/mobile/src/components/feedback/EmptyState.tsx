import { StyleSheet, Text, View } from 'react-native';

import { AppButton } from '@/components/ui/AppButton';
import { useTheme } from '@/theme/ThemeContext';
import { spacing } from '@/theme/tokens';

export function EmptyState({
  title,
  description,
  actionLabel,
  onAction,
}: {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
      <Text style={[styles.description, { color: colors.textMuted }]}>{description}</Text>
      {actionLabel && onAction ? (
        <AppButton style={styles.button} onPress={onAction} variant="secondary">
          {actionLabel}
        </AppButton>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.xxl * 2,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
  },
  description: {
    textAlign: 'center',
    maxWidth: 300,
  },
  button: {
    minWidth: 180,
    marginTop: spacing.sm,
  },
});
