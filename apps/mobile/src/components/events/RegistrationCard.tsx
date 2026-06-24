import { Alert, StyleSheet, Text, View } from 'react-native';

import { AppButton } from '@/components/ui/AppButton';
import { AppCard } from '@/components/ui/AppCard';
import { StatusPill } from '@/components/ui/StatusPill';
import { useTheme } from '@/theme/ThemeContext';
import { fontSizes, spacing } from '@/theme/tokens';
import { formatDateTime, formatName } from '@/utils/format';
import type { RegistrationInfo } from '@/services/api/admin-events';

type Props = {
  registration: RegistrationInfo;
  onCancel?: () => void;
  onUndo?: () => void;
  cancelPending?: boolean;
  undoPending?: boolean;
};

const statusTone: Record<string, 'success' | 'info' | 'warning' | 'danger'> = {
  registered: 'info',
  checked_in: 'success',
  cancelled: 'danger',
  reserved: 'warning',
  denied: 'danger',
};

export function RegistrationCard({
  registration,
  onCancel,
  onUndo,
  cancelPending,
  undoPending,
}: Props) {
  const { colors } = useTheme();
  const student = registration.studentId;
  const name = student ? formatName(student.firstName, student.lastName) : 'Unknown';
  const tone = statusTone[registration.status] ?? 'neutral';

  const handleCancel = () => {
    if (!onCancel) return;
    Alert.alert(
      'Cancel Registration',
      `Cancel registration for ${name}?`,
      [
        { text: 'No', style: 'cancel' },
        { text: 'Cancel Registration', style: 'destructive', onPress: onCancel },
      ]
    );
  };

  const handleUndo = () => {
    if (!onUndo) return;
    Alert.alert(
      'Undo Check-in',
      `Undo check-in for ${name}?`,
      [
        { text: 'No', style: 'cancel' },
        { text: 'Undo', style: 'destructive', onPress: onUndo },
      ]
    );
  };

  return (
    <AppCard style={styles.card}>
      <View style={styles.row}>
        <View style={styles.info}>
          <Text style={[styles.name, { color: colors.text }]}>{name}</Text>
          {student?.studentNumber ? (
            <Text style={[styles.meta, { color: colors.textMuted }]}>
              {student.studentNumber}
            </Text>
          ) : null}
          <Text style={[styles.meta, { color: colors.textMuted }]}>
            Registered {formatDateTime(registration.registeredAt)}
          </Text>
        </View>
        <StatusPill label={registration.status.replace('_', ' ')} tone={tone} />
      </View>

      {registration.status === 'registered' && onCancel ? (
        <AppButton variant="ghost" onPress={handleCancel} loading={cancelPending}>
          Cancel Registration
        </AppButton>
      ) : null}

      {registration.status === 'checked_in' && onUndo ? (
        <AppButton variant="ghost" onPress={handleUndo} loading={undoPending}>
          Undo Check-in
        </AppButton>
      ) : null}
    </AppCard>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.xs,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  info: {
    flex: 1,
    gap: 2,
  },
  name: {
    fontSize: fontSizes.md,
    fontWeight: '800',
  },
  meta: {
    fontSize: fontSizes.xs,
    fontWeight: '600',
  },
});
