import { StyleSheet, Text, View } from 'react-native';

import { AppButton } from '@/components/ui/AppButton';
import { AppCard } from '@/components/ui/AppCard';
import { StatusPill } from '@/components/ui/StatusPill';
import type { AttendanceLogEntry } from '@/services/api/admin-events';
import { useTheme } from '@/theme/ThemeContext';
import { fontSizes, spacing } from '@/theme/tokens';
import { formatDateTime, formatName } from '@/utils/format';

type RecentCheckInsProps = {
  logs: AttendanceLogEntry[];
  onUndo: (registrationId: string) => void;
  undoing: boolean;
  totalCheckedIn: number;
  totalDuplicates: number;
};

const resultTone: Record<string, 'success' | 'info' | 'warning' | 'danger' | 'neutral'> = {
  success: 'success',
  duplicate: 'info',
  invalid_qr: 'danger',
  not_registered: 'warning',
  not_eligible: 'warning',
  event_full: 'danger',
  registration_closed: 'danger',
  denied: 'danger',
};

export function RecentCheckIns({
  logs,
  onUndo,
  undoing,
  totalCheckedIn,
  totalDuplicates,
}: RecentCheckInsProps) {
  const { colors } = useTheme();
  const recent = logs.slice(0, 10);

  return (
    <View style={styles.container}>
      <View style={styles.statsRow}>
        <View style={[styles.stat, { backgroundColor: colors.surfaceElevated }]}>
          <Text style={[styles.statValue, { color: colors.primary }]}>{totalCheckedIn}</Text>
          <Text style={[styles.statLabel, { color: colors.textMuted }]}>Checked in</Text>
        </View>
        <View style={[styles.stat, { backgroundColor: colors.surfaceElevated }]}>
          <Text style={[styles.statValue, { color: colors.info }]}>{totalDuplicates}</Text>
          <Text style={[styles.statLabel, { color: colors.textMuted }]}>Duplicates</Text>
        </View>
      </View>

      {recent.map((log) => {
        const student = log.studentId;
        const name = student ? formatName(student.firstName, student.lastName) : 'Unknown student';
        const tone = resultTone[log.result] ?? 'neutral';

        return (
          <AppCard key={log._id} style={styles.logCard}>
            <View style={styles.logRow}>
              <View style={styles.logInfo}>
                <Text style={[styles.logName, { color: colors.text }]}>{name}</Text>
                <Text style={[styles.logTime, { color: colors.textMuted }]}>
                  {formatDateTime(log.scannedAt)} | {log.scanType}
                </Text>
              </View>
              <StatusPill label={log.result.replace('_', ' ')} tone={tone} />
            </View>
            {log.result === 'success' && log.registrationId ? (
              <AppButton variant="ghost" onPress={() => onUndo(log.registrationId!)} loading={undoing}>
                Undo
              </AppButton>
            ) : null}
          </AppCard>
        );
      })}

      {recent.length === 0 ? (
        <Text style={[styles.empty, { color: colors.textMuted }]}>
          Recent check-ins will appear here.
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  stat: {
    flex: 1,
    alignItems: 'center',
    borderRadius: 12,
    padding: spacing.md,
  },
  statValue: {
    fontSize: fontSizes.xl,
    fontWeight: '900',
  },
  statLabel: {
    fontSize: fontSizes.xs,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  logCard: {
    gap: spacing.sm,
  },
  logRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
  },
  logInfo: {
    flex: 1,
    gap: 2,
  },
  logName: {
    fontSize: fontSizes.md,
    fontWeight: '900',
  },
  logTime: {
    fontSize: fontSizes.xs,
    fontWeight: '700',
  },
  empty: {
    fontSize: fontSizes.sm,
    fontWeight: '700',
    paddingVertical: spacing.lg,
    textAlign: 'center',
  },
});

