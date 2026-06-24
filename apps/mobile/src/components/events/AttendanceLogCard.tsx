import { StyleSheet, Text, View } from 'react-native';

import { AppCard } from '@/components/ui/AppCard';
import { StatusPill } from '@/components/ui/StatusPill';
import { useTheme } from '@/theme/ThemeContext';
import { fontSizes, spacing } from '@/theme/tokens';
import { formatDateTime, formatName } from '@/utils/format';
import type { AttendanceLogEntry } from '@/services/api/admin-events';

type Props = {
  log: AttendanceLogEntry;
};

const resultTone: Record<string, 'success' | 'info' | 'warning' | 'danger'> = {
  success: 'success',
  duplicate: 'info',
  invalid_qr: 'danger',
  not_registered: 'warning',
  not_eligible: 'warning',
  event_full: 'danger',
  registration_closed: 'danger',
  denied: 'danger',
};

export function AttendanceLogCard({ log }: Props) {
  const { colors } = useTheme();
  const student = log.studentId;
  const name = student ? formatName(student.firstName, student.lastName) : 'Unknown';
  const tone = resultTone[log.result] ?? 'neutral';

  return (
    <AppCard style={styles.card}>
      <View style={styles.row}>
        <View style={styles.info}>
          <Text style={[styles.name, { color: colors.text }]}>{name}</Text>
          {student?.studentNumber ? (
            <Text style={[styles.meta, { color: colors.textMuted }]}>
              {student.studentNumber} • {log.scanType === 'entry' ? 'QR' : 'Manual'}
            </Text>
          ) : null}
          <Text style={[styles.meta, { color: colors.textMuted }]}>
            {formatDateTime(log.scannedAt)}
          </Text>
        </View>
        <StatusPill label={log.result.replace('_', ' ')} tone={tone} />
      </View>
    </AppCard>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: spacing.md,
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
