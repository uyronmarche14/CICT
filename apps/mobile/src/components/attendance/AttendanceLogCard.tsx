import { StyleSheet, Text, View } from 'react-native';

import { AppCard } from '@/components/ui/AppCard';
import { useTheme } from '@/theme/ThemeContext';
import { fontSizes, spacing } from '@/theme/tokens';
import type { AttendanceLog } from '@/types/models';
import { formatDateTime } from '@/utils/format';

const resultMessage = {
  success: 'Checked in successfully',
  duplicate: 'Already checked in',
  not_registered: 'Not registered',
  event_full: 'Event was full',
  not_eligible: 'Not eligible',
  registration_closed: 'Registration closed',
  invalid_qr: 'Invalid QR code',
  denied: 'Entry denied',
} as const;

export function AttendanceLogCard({
  log,
  isLast,
}: {
  log: AttendanceLog;
  isLast?: boolean;
}) {
  const { colors } = useTheme();

  const dotConfig = {
    success: { color: colors.success, icon: '✓' },
    duplicate: { color: colors.info, icon: '⟳' },
    not_registered: { color: colors.warning, icon: '!' },
    event_full: { color: colors.warning, icon: '!' },
    not_eligible: { color: colors.warning, icon: '!' },
    registration_closed: { color: colors.warning, icon: '!' },
    invalid_qr: { color: colors.danger, icon: '✗' },
    denied: { color: colors.danger, icon: '✗' },
  } as const;

  const dot = dotConfig[log.result];
  const message = resultMessage[log.result];

  return (
    <View style={styles.timelineRow}>
      <View style={styles.timelineLineCol}>
        <View style={[styles.dot, { backgroundColor: dot.color }]}>
          <Text style={styles.dotIcon}>{dot.icon}</Text>
        </View>
        {!isLast ? <View style={[styles.line, { backgroundColor: colors.border }]} /> : null}
      </View>

      <AppCard style={styles.card}>
        <View style={styles.cardRow}>
          <Text style={[styles.title, { color: colors.text }]}>{log.eventId.title}</Text>
        </View>
        <Text style={[styles.message, { color: colors.textMuted }]}>{message}</Text>
        <Text style={[styles.meta, { color: colors.textMuted }]}>
          {formatDateTime(log.scannedAt)} • {log.scanType}
        </Text>
      </AppCard>
    </View>
  );
}

const styles = StyleSheet.create({
  timelineRow: {
    flexDirection: 'row',
  },
  timelineLineCol: {
    width: 36,
    alignItems: 'center',
  },
  dot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
    zIndex: 1,
  },
  dotIcon: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
  },
  line: {
    width: 2,
    flex: 1,
    marginVertical: -2,
  },
  card: {
    flex: 1,
    marginLeft: spacing.sm,
    marginBottom: spacing.sm,
    gap: 4,
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  title: {
    flex: 1,
    fontSize: fontSizes.md,
    fontWeight: '800',
  },
  message: {
    fontSize: fontSizes.sm,
    fontWeight: '600',
  },
  meta: {
    fontSize: fontSizes.xs,
  },
});
