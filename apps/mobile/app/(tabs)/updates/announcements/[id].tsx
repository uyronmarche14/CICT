import { Image, Share, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { ErrorState } from '@/components/feedback/ErrorState';
import { LoadingState } from '@/components/feedback/LoadingState';
import { AppButton } from '@/components/ui/AppButton';
import { AppScreen } from '@/components/ui/AppScreen';
import { StatusPill } from '@/components/ui/StatusPill';
import { useAnnouncementById } from '@/features/announcements/useAnnouncementById';
import { useTheme } from '@/theme/ThemeContext';
import { fontSizes, spacing } from '@/theme/tokens';
import { formatDate, stripHtml } from '@/utils/format';

const priorityToneMap = {
  low: 'info',
  medium: 'warning',
  high: 'danger',
  urgent: 'danger',
} as const;

export default function AnnouncementDetailScreen() {
  const { colors } = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const announcementQuery = useAnnouncementById(id ?? '');

  if (announcementQuery.isPending && !announcementQuery.data) {
    return (
      <AppScreen scroll={false}>
        <LoadingState label="Loading announcement..." />
      </AppScreen>
    );
  }

  if (announcementQuery.isError || !announcementQuery.data) {
    return (
      <AppScreen scroll={false}>
        <ErrorState
          description="We couldn't load this announcement."
          onAction={() => void announcementQuery.refetch()}
        />
      </AppScreen>
    );
  }

  const announcement = announcementQuery.data;

  return (
    <AppScreen>
      <View style={styles.headerRow}>
        <AppButton variant="ghost" onPress={() => router.back()}>
          Back
        </AppButton>
        <AppButton variant="ghost" onPress={() => Share.share({ message: `${announcement.title}\n\n${stripHtml(announcement.content || announcement.bodyHtml).slice(0, 200)}...`, title: announcement.title })}>
          Share
        </AppButton>
      </View>

      {announcement.imageUrl ? (
        <Image source={{ uri: announcement.imageUrl }} style={[styles.heroImage, { backgroundColor: colors.surfaceMuted }]} />
      ) : null}

      <View style={styles.metaRow}>
        <StatusPill
          label={announcement.priority}
          tone={priorityToneMap[announcement.priority]}
        />
        <Text style={[styles.date, { color: colors.textMuted }]}>
          {formatDate(announcement.publishedAt || announcement.createdAt)}
        </Text>
      </View>

      <Text style={[styles.title, { color: colors.text }]}>{announcement.title}</Text>

      <View style={styles.body}>
        <Text style={[styles.bodyText, { color: colors.text }]}>
          {stripHtml(announcement.content || announcement.bodyHtml)}
        </Text>
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  heroImage: {
    width: '100%',
    height: 220,
    borderRadius: 20,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  date: {
    fontSize: fontSizes.xs,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  title: {
    fontSize: fontSizes.xl,
    fontWeight: '900',
    lineHeight: 32,
  },
  body: {
    gap: spacing.sm,
  },
  bodyText: {
    lineHeight: 24,
    fontSize: fontSizes.md,
  },
});
