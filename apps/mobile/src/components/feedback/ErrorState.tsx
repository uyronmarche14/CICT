import { StyleSheet, Text, View } from 'react-native';

import { AppButton } from '@/components/ui/AppButton';
import { useTheme } from '@/theme/ThemeContext';
import { spacing } from '@/theme/tokens';

export function ErrorState({
  title = 'Something went wrong',
  description,
  actionLabel = 'Try again',
  onAction,
}: {
  title?: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
      <Text style={[styles.description, { color: colors.textMuted }]}>{description}</Text>
      {onAction ? (
        <AppButton onPress={onAction} variant="secondary" style={styles.button}>
          {actionLabel}
        </AppButton>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxl * 2,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
  },
  description: {
    textAlign: 'center',
    maxWidth: 320,
  },
  button: {
    minWidth: 180,
    marginTop: spacing.sm,
  },
});
