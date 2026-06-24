import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AppCard } from '@/components/ui/AppCard';
import { StatusPill } from '@/components/ui/StatusPill';
import { useTheme } from '@/theme/ThemeContext';
import { fontSizes, spacing } from '@/theme/tokens';
import { formatDate } from '@/utils/format';
import type { AdminEvent } from '@/features/events/useAdminEvents';

type Props = {
  event: AdminEvent;
  onPress?: () => void;
  actionLabel?: string;
};

export function AdminEventCard({ event, onPress, actionLabel }: Props) {
  const { colors } = useTheme();

  const fillPercent = event.maxAttendees
    ? Math.round(((event.registeredCount ?? 0) / event.maxAttendees) * 100)
    : 0;

  const barColor =
    fillPercent >= 100 ? colors.danger
    : fillPercent >= 90 ? colors.warning
    : colors.success;

  return (
    <Pressable onPress={onPress}>
      <AppCard style={styles.card}>
        <View style={styles.headerRow}>
          <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
            {event.title}
          </Text>
          <StatusPill label={event.status} tone="info" />
        </View>

        <Text style={[styles.meta, { color: colors.textMuted }]}>
          {formatDate(event.startDate)} • {event.location}
        </Text>

        <View style={styles.statsRow}>
          <Text style={[styles.stat, { color: colors.primary }]}>
            {event.registeredCount ?? 0} registered
          </Text>
          <Text style={[styles.stat, { color: colors.success }]}>
            {event.checkedInCount ?? 0} checked in
          </Text>
        </View>

        {event.maxAttendees ? (
          <View style={styles.capacityRow}>
            <View style={[styles.capacityBar, { backgroundColor: colors.surfaceMuted }]}>
              <View
                style={[
                  styles.capacityFill,
                  { width: `${Math.min(fillPercent, 100)}%`, backgroundColor: barColor },
                ]}
              />
            </View>
            <Text style={[styles.capacityText, { color: colors.textMuted }]}>
              {event.registeredCount ?? 0}/{event.maxAttendees}
            </Text>
          </View>
        ) : null}

        {actionLabel ? (
          <Text style={[styles.actionLink, { color: colors.primary }]}>{actionLabel}</Text>
        ) : null}
      </AppCard>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.sm,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  title: {
    flex: 1,
    fontSize: fontSizes.lg,
    fontWeight: '800',
  },
  meta: {
    fontSize: fontSizes.sm,
    fontWeight: '600',
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  stat: {
    fontSize: fontSizes.xs,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  capacityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  capacityBar: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  capacityFill: {
    height: '100%',
    borderRadius: 4,
  },
  capacityText: {
    fontSize: fontSizes.xs,
    fontWeight: '700',
    minWidth: 50,
    textAlign: 'right',
  },
  actionLink: {
    fontSize: fontSizes.sm,
    fontWeight: '700',
    textAlign: 'right',
  },
});
