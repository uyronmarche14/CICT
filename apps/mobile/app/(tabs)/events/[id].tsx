import { useQueryClient } from '@tanstack/react-query';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Alert, Image, Linking, ScrollView, StyleSheet, Text, View } from 'react-native';

import { AddToCalendarButton } from '@/components/events/AddToCalendarButton';
import { EventCountdown } from '@/components/events/EventCountdown';
import { EmptyState } from '@/components/feedback/EmptyState';
import { ErrorState } from '@/components/feedback/ErrorState';
import { LoadingState } from '@/components/feedback/LoadingState';
import { AppButton } from '@/components/ui/AppButton';
import { AppCard } from '@/components/ui/AppCard';
import { AppScreen } from '@/components/ui/AppScreen';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { StatusPill } from '@/components/ui/StatusPill';
import { queryKeys } from '@/constants/queryKeys';
import {
  useCancelEventRegistration,
  useRegisterForEvent,
} from '@/features/events/useStudentEvents';
import { useStudentEvent, useStudentRegistration } from '@/features/events/useStudentEvent';
import { useTheme } from '@/theme/ThemeContext';
import { fontSizes, radii, spacing } from '@/theme/tokens';
import { formatDate, formatDateTime, stripHtml } from '@/utils/format';
import { getErrorMessage } from '@/utils/error';
import { hapticSuccess } from '@/utils/haptics';
import { scheduleEventReminder, cancelEventReminder } from '@/services/notifications/local-reminders';

export default function EventDetailScreen() {
  const { colors } = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const eventQuery = useStudentEvent(id);
  const registrationQuery = useStudentRegistration(id);
  const registerMutation = useRegisterForEvent(id);
  const cancelMutation = useCancelEventRegistration(id);

  const event = eventQuery.data;
  const registration = registrationQuery.data ?? event?.registration ?? null;
  const registrationStatus = registration?.status;

  if (eventQuery.isPending && !event) {
    return (
      <AppScreen scroll={false}>
        <LoadingState label="Loading event details..." />
      </AppScreen>
    );
  }

  if (eventQuery.isError || !event) {
    return (
      <AppScreen scroll={false}>
        <ErrorState
          description="We couldn't load this event."
          onAction={() => {
            void eventQuery.refetch();
          }}
        />
      </AppScreen>
    );
  }

  const isEventPast = event ? new Date(event.endDate) < new Date() : false;

  const handleRegister = async () => {
    try {
      await registerMutation.mutateAsync();
      hapticSuccess();
      if (event) {
        scheduleEventReminder(event);
      }
      Alert.alert('Registered', 'You are now registered for this event.');
    } catch (error) {
      Alert.alert('Registration failed', getErrorMessage(error));
    }
  };

  const handleCancel = async () => {
    try {
      await cancelMutation.mutateAsync();
      await queryClient.invalidateQueries({ queryKey: queryKeys.registration(id) });
      cancelEventReminder(id ?? '');
      Alert.alert('Registration cancelled', 'Your slot has been released.');
    } catch (error) {
      Alert.alert('Cancellation failed', getErrorMessage(error));
    }
  };

  return (
    <AppScreen>
      <AppButton variant="ghost" onPress={() => router.back()}>
        Back
      </AppButton>

      {event.coverImage?.imageUrl || event.imageUrl ? (
        <Image source={{ uri: event.coverImage?.imageUrl || event.imageUrl }} style={[styles.heroImage, { backgroundColor: colors.surfaceMuted }]} />
      ) : null}

      {event.gallery && event.gallery.length > 0 ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.galleryRow}>
          {event.gallery.map((img, i) => (
            <Image
              key={i}
              source={{ uri: img.imageUrl }}
              style={[styles.galleryImage, { backgroundColor: colors.surfaceMuted }]}
            />
          ))}
        </ScrollView>
      ) : null}

      <SectionHeader title={event.title} subtitle={`${formatDate(event.startDate)} • ${event.location}`} />

      <View style={styles.statusRow}>
        <StatusPill label={event.status} tone="info" />
        {registrationStatus ? (
          <StatusPill label={registrationStatus.replace('_', ' ')} tone="success" />
        ) : (
          <StatusPill label={event.isRegistrationOpen ? 'Open for registration' : 'Registration closed'} tone={event.isRegistrationOpen ? 'warning' : 'danger'} />
        )}
        {event.allowWalkIns ? (
          <StatusPill label="Walk-ins allowed" tone="warning" />
        ) : null}
      </View>

      {!isEventPast ? <EventCountdown targetDate={event.startDate} /> : null}

      <AppCard>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>About this event</Text>
        <Text style={[styles.bodyText, { color: colors.textMuted }]}>
          {stripHtml(event.bodyHtml) || event.description || event.excerpt}
        </Text>
      </AppCard>

      <AddToCalendarButton event={event} />

      {event.maxAttendees ? (
        <AppCard>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Capacity</Text>
          <Text style={[styles.bodyText, { color: colors.text }]}>
            {event.registeredCount ?? 0} / {event.maxAttendees} filled
          </Text>
          {event.checkedInCount != null ? (
            <Text style={[styles.bodyText, { color: colors.textMuted }]}>
              {event.checkedInCount} checked in
            </Text>
          ) : null}
        </AppCard>
      ) : null}

      {event.feeLabel ? (
        <>
          <SectionHeader title="Registration Fee" />
          <AppCard>
            <Text style={{ fontSize: 18, fontWeight: '700' }}>
              {event.feeLabel}
            </Text>
          </AppCard>
        </>
      ) : null}

      {event.tags && event.tags.length > 0 ? (
        <>
          <SectionHeader title="Tags" />
          <View style={styles.tagsRow}>
            {event.tags.map((tag: string) => (
              <StatusPill key={tag} label={tag} tone="neutral" />
            ))}
          </View>
        </>
      ) : null}

      {event.speakerItems && event.speakerItems.length > 0 ? (
        <>
          <SectionHeader title="Speakers" />
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {event.speakerItems.map((speaker, index) => (
              <AppCard key={index} style={styles.speakerCard}>
                {speaker.photo?.imageUrl ? (
                  <Image source={{ uri: speaker.photo.imageUrl }} style={styles.speakerImage} />
                ) : (
                  <View style={[styles.speakerImagePlaceholder, { backgroundColor: colors.primary }]}>
                    <Text style={styles.speakerImageInitial}>{speaker.name[0]}</Text>
                  </View>
                )}
                <Text style={[styles.speakerName, { color: colors.text }]}>{speaker.name}</Text>
                {speaker.title ? <Text style={[styles.speakerDetail, { color: colors.textMuted }]}>{speaker.title}</Text> : null}
                {speaker.organization ? <Text style={[styles.speakerDetail, { color: colors.textMuted }]}>{speaker.organization}</Text> : null}
              </AppCard>
            ))}
          </ScrollView>
        </>
      ) : null}

      {event.contactName ? (
        <>
          <SectionHeader title="Organizer Contact" />
          <AppCard>
            <Text style={[styles.bodyText, { color: colors.text }]}>{event.contactName}</Text>
            {event.contactEmail ? <Text style={[styles.bodyText, { color: colors.textMuted }]}>{event.contactEmail}</Text> : null}
          </AppCard>
        </>
      ) : null}

      {event.venueDetails ? (
        <>
          <SectionHeader title="Venue" />
          <AppCard>
            {event.venueDetails.name ? (
              <Text style={[styles.sectionTitle, { color: colors.text }]}>{event.venueDetails.name}</Text>
            ) : null}
            {event.location ? (
              <Text style={[styles.bodyText, { color: colors.textMuted }]}>{event.location}</Text>
            ) : null}
            {event.venueDetails.room ? (
              <Text style={[styles.bodyText, { color: colors.textMuted }]}>Room {event.venueDetails.room}</Text>
            ) : null}
            {event.venueDetails.capacity ? (
              <Text style={[styles.bodyText, { color: colors.textMuted }]}>Capacity: {event.venueDetails.capacity}</Text>
            ) : null}
            {event.venueDetails.accessibility ? (
              <Text style={[styles.bodyText, { color: colors.textMuted }]}>{event.venueDetails.accessibility}</Text>
            ) : null}
            {event.mapUrl ? (
              <AppButton variant="secondary" onPress={() => Linking.openURL(event.mapUrl!)}>
                Open in Maps
              </AppButton>
            ) : null}
          </AppCard>
        </>
      ) : null}

      {event.schedule?.length ? (
        <AppCard>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Event schedule</Text>
          {event.schedule.map((item, index) => (
            <View key={`${item.label}-${index}`} style={styles.scheduleItem}>
              <Text style={[styles.scheduleLabel, { color: colors.primary }]}>{item.label}</Text>
              <Text style={[styles.scheduleTitle, { color: colors.text }]}>{item.title}</Text>
              {item.description ? <Text style={[styles.bodyText, { color: colors.textMuted }]}>{item.description}</Text> : null}
            </View>
          ))}
        </AppCard>
      ) : null}

      {registrationStatus === 'registered' || registrationStatus === 'checked_in' ? (
        <>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Your ticket</Text>
          <View style={[styles.ticketCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={[styles.ticketAccent, { backgroundColor: colors.primary }]} />
            <View style={styles.ticketInner}>
              <View style={styles.ticketHeader}>
                <Text style={[styles.ticketTitle, { color: colors.text }]} numberOfLines={1}>
                  {event.title}
                </Text>
                <Text style={[styles.ticketDetail, { color: colors.textMuted }]}>
                  {formatDate(event.startDate)} • {event.location}
                </Text>
              </View>
              <View style={styles.ticketActions}>
                <StatusPill
                  label={registrationStatus === 'checked_in' ? 'Checked in' : 'Registered'}
                  tone={registrationStatus === 'checked_in' ? 'success' : 'info'}
                />
                <AppButton
                  onPress={() => router.push(`/(tabs)/events/${id}/qr`)}
                  style={styles.viewTicketButton}
                >
                  View ticket
                </AppButton>
              </View>
              {registrationStatus === 'registered' ? (
                <>
                  <View style={[styles.ticketDivider, { borderColor: colors.border }]} />
                  <AppButton
                    variant="ghost"
                    loading={cancelMutation.isPending}
                    onPress={handleCancel}
                    style={styles.cancelButton}
                  >
                    Cancel registration
                  </AppButton>
                </>
              ) : null}
            </View>
          </View>
        </>
      ) : (
        <AppCard>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Registration</Text>
          {event.isRegistrationOpen ? (
            <View style={styles.actionsColumn}>
              {event.registrationCloseAt ? (
                <Text style={[styles.bodyText, { color: colors.textMuted }]}>
                  Registration closes {formatDateTime(event.registrationCloseAt)}
                </Text>
              ) : null}
              <AppButton loading={registerMutation.isPending} onPress={handleRegister}>
                Register now
              </AppButton>
            </View>
          ) : (
            <EmptyState
              title="Registration closed"
              description="This event is published, but registration is not currently open."
            />
          )}
        </AppCard>
      )}
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  heroImage: {
    width: '100%',
    height: 220,
    borderRadius: 20,
  },
  statusRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  bodyText: {
    lineHeight: 22,
  },
  scheduleItem: {
    gap: 4,
    paddingTop: spacing.sm,
  },
  scheduleLabel: {
    fontWeight: '800',
    textTransform: 'uppercase',
    fontSize: 12,
  },
  scheduleTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  actionsColumn: {
    gap: spacing.sm,
  },
  ticketCard: {
    flexDirection: 'row',
    borderRadius: radii.xl,
    overflow: 'hidden',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
  ticketAccent: {
    width: 5,
  },
  ticketInner: {
    flex: 1,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  ticketHeader: {
    gap: 2,
  },
  ticketTitle: {
    fontSize: fontSizes.lg,
    fontWeight: '900',
  },
  ticketDetail: {
    fontSize: fontSizes.sm,
    fontWeight: '600',
  },
  ticketActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  viewTicketButton: {
    minWidth: 120,
  },
  ticketDivider: {
    borderTopWidth: 1,
    borderStyle: 'dashed',
  },
  cancelButton: {
    alignSelf: 'flex-start',
    paddingHorizontal: 0,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  speakerCard: {
    width: 180,
    marginRight: spacing.sm,
    alignItems: 'center',
    gap: spacing.xs,
  },
  speakerImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  speakerImagePlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  speakerImageInitial: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '900',
  },
  speakerName: {
    fontSize: fontSizes.md,
    fontWeight: '800',
    textAlign: 'center',
  },
  speakerDetail: {
    fontSize: fontSizes.xs,
    textAlign: 'center',
  },
  galleryRow: {
    marginTop: spacing.sm,
  },
  galleryImage: {
    width: 120,
    height: 90,
    borderRadius: radii.md,
    marginRight: spacing.sm,
  },
});
