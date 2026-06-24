import { useNetInfo } from '@react-native-community/netinfo';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';

import { ConnectivityNotice } from '@/components/feedback/ConnectivityNotice';
import { EmptyState } from '@/components/feedback/EmptyState';
import { ErrorState } from '@/components/feedback/ErrorState';
import { EventCountdown } from '@/components/events/EventCountdown';
import { LoadingState } from '@/components/feedback/LoadingState';
import { AppButton } from '@/components/ui/AppButton';
import { AppCard } from '@/components/ui/AppCard';
import { AppScreen } from '@/components/ui/AppScreen';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { StatusPill } from '@/components/ui/StatusPill';
import { useAnnouncementsFeed } from '@/features/announcements/useAnnouncementsFeed';
import { useAttendanceHistory } from '@/features/attendance/useAttendanceHistory';
import { useStudentEvents } from '@/features/events/useStudentEvents';
import { useStudentProfile } from '@/features/profile/useStudentProfile';
import { useTheme } from '@/theme/ThemeContext';
import { fontSizes, radii, spacing } from '@/theme/tokens';
import { formatDate, formatName } from '@/utils/format';

export default function HomeScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const netInfo = useNetInfo();
  const profileQuery = useStudentProfile();
  const updatesQuery = useAnnouncementsFeed(4);
  const eventsQuery = useStudentEvents();
  const attendanceQuery = useAttendanceHistory();

  const isRefreshing =
    profileQuery.isRefetching ||
    updatesQuery.isRefetching ||
    eventsQuery.isRefetching ||
    attendanceQuery.isRefetching;

  const upcomingEvent = eventsQuery.data?.find((event) => new Date(event.endDate) >= new Date()) ?? null;
  const checkedInCount =
    attendanceQuery.data?.filter((log) => log.result === 'success').length ?? 0;
  const registeredCount =
    eventsQuery.data?.filter((event) =>
      ['registered', 'checked_in'].includes(event.registration?.status ?? '')
    ).length ?? 0;

  const refetchAll = () =>
    Promise.all([
      profileQuery.refetch(),
      updatesQuery.refetch(),
      eventsQuery.refetch(),
      attendanceQuery.refetch(),
    ]);

  if (profileQuery.isPending && !profileQuery.data) {
    return (
      <AppScreen scroll={false}>
        <LoadingState label="Loading your dashboard..." />
      </AppScreen>
    );
  }

  if (profileQuery.isError) {
    return (
      <AppScreen scroll={false}>
        <ErrorState
          description="We couldn't load your dashboard right now."
          onAction={() => {
            void refetchAll();
          }}
        />
      </AppScreen>
    );
  }

  return (
    <AppScreen
      refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={() => void refetchAll()} />}
      >
        {!netInfo.isConnected ? <ConnectivityNotice /> : null}

        <LinearGradient
          colors={['#6E29F6', '#4A1BB5', '#2E0F8A']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.hero}
        >
          <View style={styles.heroTextCol}>
            <Text style={styles.eyebrow}>Welcome back</Text>
            <Text style={styles.heroTitle} numberOfLines={1}>
              {formatName(profileQuery.data?.firstName, profileQuery.data?.lastName)}
            </Text>
          </View>
          <Text style={styles.heroSubtitle}>
            Track registrations, view your attendance pass, and stay in sync with campus updates.
          </Text>

          <View style={styles.metricsRow}>
            <Pressable
              style={styles.metricCard}
              onPress={() => router.push('/(tabs)/events/registrations')}
            >
              <Text style={styles.metricValue}>{registeredCount}</Text>
              <Text style={styles.metricLabel}>Active registrations</Text>
            </Pressable>
            <View style={styles.metricCard}>
              <Text style={styles.metricValue}>{checkedInCount}</Text>
              <Text style={styles.metricLabel}>Check-ins</Text>
            </View>
          </View>
        </LinearGradient>

      <SectionHeader title="Upcoming event" subtitle="Your next attendance action" />
      {upcomingEvent ? (
        <AppCard variant="elevated">
          <View style={styles.eventHeader}>
            <View style={styles.eventMeta}>
              <Text style={[styles.eventDate, { color: colors.textMuted }]}>{formatDate(upcomingEvent.startDate)}</Text>
              <Text style={[styles.eventLocation, { color: colors.textMuted }]}>{upcomingEvent.location}</Text>
            </View>
            <StatusPill
              label={upcomingEvent.registration?.status?.replace('_', ' ') || 'Open'}
              tone={upcomingEvent.registration ? 'info' : 'warning'}
            />
          </View>
          <EventCountdown targetDate={upcomingEvent.startDate} />
          <Text style={[styles.eventTitle, { color: colors.text }]}>{upcomingEvent.title}</Text>
          <Text style={[styles.eventBody, { color: colors.textMuted }]}>{upcomingEvent.excerpt}</Text>
          <View style={styles.actionsRow}>
            <AppButton onPress={() => router.push('/(tabs)/events')}>Browse events</AppButton>
            {upcomingEvent.registration ? (
              <AppButton
                variant="secondary"
                onPress={() => router.push(`/(tabs)/events/${upcomingEvent._id}/qr`)}
              >
                QR pass
              </AppButton>
            ) : null}
          </View>
        </AppCard>
      ) : (
        <EmptyState
          title="No upcoming events yet"
          description="When eligible events are available, they will appear here."
          actionLabel="Browse events"
          onAction={() => router.push('/(tabs)/events')}
        />
      )}

      <View style={styles.sectionHeaderRow}>
        <SectionHeader title="Latest updates" subtitle="Announcements and news" />
        <Pressable onPress={() => router.push('/(tabs)/updates')}>
          <Text style={[styles.seeAllText, { color: colors.primary }]}>See all</Text>
        </Pressable>
      </View>
      {updatesQuery.isError ? (
        <ErrorState
          description="Updates are temporarily unavailable."
          onAction={() => {
            void updatesQuery.refetch();
          }}
        />
      ) : updatesQuery.isPending && !updatesQuery.data ? (
        <LoadingState label="Loading updates..." />
      ) : !updatesQuery.data?.items.length ? (
        <EmptyState
          title="No updates yet"
          description="Published announcements and news will appear here once available."
        />
      ) : (
        updatesQuery.data?.items.map((item) => (
          <AppCard key={`${item.kind}-${item.id}`}>
            <View style={styles.updateHeader}>
              <StatusPill label={item.kind} tone={item.kind === 'announcement' ? 'warning' : 'info'} />
              <Text style={[styles.updateDate, { color: colors.textMuted }]}>{formatDate(item.publishedAt)}</Text>
            </View>
            <Text style={[styles.updateTitle, { color: colors.text }]}>{item.title}</Text>
            <Text style={[styles.updateBody, { color: colors.textMuted }]}>{item.summary}</Text>
          </AppCard>
        ))
      )}
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  hero: {
    borderRadius: radii.lg,
    padding: spacing.lg,
    gap: spacing.xs,
  },
  heroTextCol: {
    gap: 2,
  },
  eyebrow: {
    color: '#D4C5FF',
    fontWeight: '700',
    textTransform: 'uppercase',
    fontSize: fontSizes.xs,
  },
  heroTitle: {
    color: '#FFFFFF',
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '900',
  },
  heroSubtitle: {
    color: '#D4C5FF',
    lineHeight: 22,
    fontSize: fontSizes.sm,
  },
  metricsRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.sm,
  },
  metricCard: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: radii.md,
    padding: spacing.md,
    gap: 4,
  },
  metricValue: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '900',
  },
  metricLabel: {
    color: '#D4C5FF',
    fontSize: fontSizes.xs,
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  eventMeta: {
    gap: 2,
  },
  eventDate: {
    fontSize: fontSizes.xs,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  eventLocation: {
    fontSize: fontSizes.xs,
  },
  eventTitle: {
    fontSize: fontSizes.lg,
    fontWeight: '800',
  },
  eventBody: {
    lineHeight: 22,
    fontSize: fontSizes.sm,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  seeAllText: {
    fontSize: fontSizes.sm,
    fontWeight: '700',
  },
  updateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.sm,
  },
  updateDate: {
    fontSize: fontSizes.xs,
    fontWeight: '700',
  },
  updateTitle: {
    fontSize: fontSizes.md,
    fontWeight: '700',
  },
  updateBody: {
    lineHeight: 22,
    fontSize: fontSizes.sm,
  },
});
