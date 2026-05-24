import { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import QRCode from 'react-native-qrcode-svg';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { TicketShareButton } from '@/components/events/TicketShareButton';
import { ErrorState } from '@/components/feedback/ErrorState';
import { LoadingState } from '@/components/feedback/LoadingState';
import { AppButton } from '@/components/ui/AppButton';
import { AppScreen } from '@/components/ui/AppScreen';
import { StatusPill } from '@/components/ui/StatusPill';
import { useStudentEvent } from '@/features/events/useStudentEvent';
import { useStudentQrPayload, useStudentRegistration } from '@/features/events/useStudentEvent';
import { qrCache } from '@/services/storage/qr-cache';
import { useTheme } from '@/theme/ThemeContext';
import { fontSizes, radii, spacing } from '@/theme/tokens';
import { formatDate } from '@/utils/format';
import { hapticSuccess } from '@/utils/haptics';

function generateTicketId() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = 'CICT-';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export default function EventQrScreen() {
  const { colors } = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const qrQuery = useStudentQrPayload(id);
  const registrationQuery = useStudentRegistration(id);
  const eventQuery = useStudentEvent(id);
  const slideUp = useRef(new Animated.Value(60)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const [isOffline, setIsOffline] = useState(false);
  const ticketRef = useRef<View>(null);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(slideUp, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();

    if (qrQuery.data) {
      qrCache.cacheToken(id ?? '', qrQuery.data.token);
      hapticSuccess();
    }
  }, [slideUp, opacity, qrQuery.data, id]);

  useEffect(() => {
    if (qrQuery.isError && !qrQuery.data) {
      qrCache.getCachedToken(id ?? '').then((cached) => {
        if (cached) {
          setIsOffline(true);
        }
      });
    }
  }, [qrQuery.isError, qrQuery.data, id]);

  if (qrQuery.isPending && !qrQuery.data) {
    return (
      <AppScreen scroll={false}>
        <LoadingState label="Generating your ticket..." />
      </AppScreen>
    );
  }

  if ((qrQuery.isError || !qrQuery.data) && !isOffline) {
    return (
      <AppScreen scroll={false}>
        <ErrorState
          description="We couldn't load your ticket. Make sure you are registered for this event."
          onAction={() => void qrQuery.refetch()}
        />
      </AppScreen>
    );
  }

  const event = eventQuery.data;
  const eventTitle = event?.title ?? 'Event';
  const eventDate = event?.startDate ? formatDate(event.startDate) : '';
  const eventLocation = event?.location ?? '';
  const isCheckedIn = registrationQuery.data?.status === 'checked_in';
  const ticketId = generateTicketId();
  const qrToken = qrQuery.data?.token ?? '';

  return (
    <AppScreen>
      <AppButton variant="ghost" onPress={() => router.back()}>
        Back to event
      </AppButton>

      <View style={styles.centeredWrapper} ref={ticketRef}>
        {isOffline ? (
          <View style={styles.offlineBanner}>
            <StatusPill label="Offline mode" tone="warning" />
          </View>
        ) : null}
        <Animated.View
          style={[
            styles.ticket,
            { backgroundColor: colors.surface, transform: [{ translateY: slideUp }], opacity },
          ]}
        >
          <LinearGradient
            colors={['#6E29F6', '#4A1BB5']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.ticketHeader}
          >
            <Text style={styles.ticketLabel}>ADMIT ONE</Text>
            <Text style={styles.ticketTitle} numberOfLines={2}>
              {eventTitle}
            </Text>
            <View style={styles.ticketMetaRow}>
              <Text style={styles.ticketMetaText}>{eventDate}</Text>
              <Text style={styles.ticketMetaDot}>•</Text>
              <Text style={styles.ticketMetaText} numberOfLines={1}>
                {eventLocation}
              </Text>
            </View>
          </LinearGradient>

          <View style={styles.ticketBody}>
            <View style={[styles.qrWrapper, { backgroundColor: colors.background, borderColor: colors.border }]}>
              <QRCode value={qrToken} size={240} />
            </View>

            <StatusPill
              label={isCheckedIn ? 'Checked in' : 'Ready for scanning'}
              tone={isCheckedIn ? 'success' : 'info'}
            />

            <View style={styles.ticketFooter}>
              <Text style={[styles.ticketIdLabel, { color: colors.textMuted }]}>Ticket ID</Text>
              <Text style={[styles.ticketId, { color: colors.text }]}>{ticketId}</Text>
            </View>

            <Text style={[styles.ticketNote, { color: colors.textMuted }]}>
              Keep your brightness high for reliable scanning.
            </Text>

            <TicketShareButton>
              <View style={[styles.sharedTicket, { backgroundColor: colors.background }]}>
                <LinearGradient
                  colors={['#6E29F6', '#4A1BB5']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.sharedTicketHeader}
                >
                  <Text style={styles.sharedTicketTitle}>{eventTitle}</Text>
                  <Text style={styles.sharedTicketMeta}>{eventDate} • {eventLocation}</Text>
                </LinearGradient>
                <View style={styles.sharedTicketBody}>
                  <QRCode value={qrToken} size={140} />
                  <Text style={[styles.sharedTicketId, { color: colors.textMuted }]}>{ticketId}</Text>
                </View>
              </View>
            </TicketShareButton>
          </View>
        </Animated.View>
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  centeredWrapper: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.xs,
  },
  ticket: {
    borderRadius: radii.xl,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 12 },
    elevation: 10,
  },
  ticketHeader: {
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
    gap: spacing.xs,
    alignItems: 'center',
  },
  ticketLabel: {
    color: '#D4C5FF',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 3,
  },
  ticketTitle: {
    color: '#FFFFFF',
    fontSize: fontSizes.xl,
    fontWeight: '900',
    textAlign: 'center',
    lineHeight: 30,
  },
  ticketMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  ticketMetaText: {
    color: '#D4C5FF',
    fontSize: fontSizes.sm,
    fontWeight: '600',
  },
  ticketMetaDot: {
    color: '#D4C5FF',
    fontSize: fontSizes.sm,
    fontWeight: '600',
  },
  ticketBody: {
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.md,
    gap: spacing.md,
    alignItems: 'center',
  },
  qrWrapper: {
    backgroundColor: '#FFFFFF',
    padding: spacing.sm,
    borderRadius: 24,
    borderWidth: 1,
  },
  ticketFooter: {
    alignItems: 'center',
    gap: 2,
  },
  ticketIdLabel: {
    fontSize: fontSizes.xs,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  ticketId: {
    fontSize: fontSizes.md,
    fontWeight: '800',
    letterSpacing: 1,
    fontVariant: ['tabular-nums'],
  },
  ticketNote: {
    textAlign: 'center',
    fontSize: fontSizes.xs,
    lineHeight: 18,
  },
  offlineBanner: {
    marginBottom: spacing.sm,
    alignItems: 'center',
  },
  sharedTicket: {
    width: 280,
    borderRadius: radii.xl,
    overflow: 'hidden',
  },
  sharedTicketHeader: {
    padding: spacing.lg,
    alignItems: 'center',
    gap: 4,
  },
  sharedTicketTitle: {
    color: '#FFFFFF',
    fontSize: fontSizes.lg,
    fontWeight: '900',
    textAlign: 'center',
  },
  sharedTicketMeta: {
    color: '#D4C5FF',
    fontSize: fontSizes.sm,
    fontWeight: '600',
  },
  sharedTicketBody: {
    padding: spacing.lg,
    alignItems: 'center',
    gap: spacing.sm,
  },
  sharedTicketId: {
    fontSize: fontSizes.xs,
    fontWeight: '700',
    letterSpacing: 1,
  },
});
