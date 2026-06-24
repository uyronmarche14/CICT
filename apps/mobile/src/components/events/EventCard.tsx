import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { AppCard } from '@/components/ui/AppCard';
import { StatusPill } from '@/components/ui/StatusPill';
import { useTheme } from '@/theme/ThemeContext';
import { spacing } from '@/theme/tokens';
import type { StudentEvent, StudentRegistrationStatus } from '@/types/models';
import { formatDate } from '@/utils/format';

type StatusPillTone = 'success' | 'warning' | 'info' | 'neutral' | 'danger';

const registrationToneMap: Record<StudentRegistrationStatus, StatusPillTone> = {
  registered: 'info',
  checked_in: 'success',
  cancelled: 'danger',
  reserved: 'warning',
  denied: 'danger',
};

export function EventCard({
  event,
  onPress,
}: {
  event: StudentEvent;
  onPress?: () => void;
}) {
  const { colors } = useTheme();
  const imageUrl = event.coverImage?.imageUrl || event.imageUrl;
  const registrationStatus = event.registration?.status;

  return (
    <Pressable onPress={onPress}>
      <AppCard variant="elevated" style={styles.card}>
        {imageUrl ? <Image source={{ uri: imageUrl }} style={[styles.image, { backgroundColor: colors.surfaceSoft }]} /> : null}

        <View style={styles.content}>
          <View style={styles.headerRow}>
            <Text style={[styles.title, { color: colors.text }]}>{event.title}</Text>
            {registrationStatus ? (
              <StatusPill
                label={registrationStatus.replace('_', ' ')}
                tone={registrationToneMap[registrationStatus]}
              />
            ) : null}
          </View>

          <Text style={[styles.meta, { color: colors.textMuted }]}>
            {formatDate(event.startDate)} • {event.location}
          </Text>

          {event.maxAttendees ? (
            <Text style={[styles.meta, { color: colors.textMuted }]}>
              {event.registeredCount ?? 0} / {event.maxAttendees} registered
            </Text>
          ) : null}

          {event.allowWalkIns ? (
            <StatusPill label="Walk-ins allowed" tone="warning" />
          ) : null}

          <Text numberOfLines={3} style={[styles.summary, { color: colors.textMuted }]}>
            {event.excerpt}
          </Text>
        </View>
      </AppCard>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 0,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: 180,
  },
  content: {
    padding: spacing.lg,
    gap: spacing.sm,
  },
  headerRow: {
    gap: spacing.sm,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
  },
  meta: {
    fontWeight: '600',
  },
  summary: {
    lineHeight: 21,
  },
});
