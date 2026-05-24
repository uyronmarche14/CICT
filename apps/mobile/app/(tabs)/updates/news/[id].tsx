import { Image, Share, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { ErrorState } from '@/components/feedback/ErrorState';
import { LoadingState } from '@/components/feedback/LoadingState';
import { AppButton } from '@/components/ui/AppButton';
import { AppScreen } from '@/components/ui/AppScreen';
import { useNewsById } from '@/features/news/useNewsById';
import { useTheme } from '@/theme/ThemeContext';
import { fontSizes, spacing } from '@/theme/tokens';
import { formatDate, stripHtml } from '@/utils/format';

export default function NewsDetailScreen() {
  const { colors } = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const newsQuery = useNewsById(id ?? '');

  if (newsQuery.isPending && !newsQuery.data) {
    return (
      <AppScreen scroll={false}>
        <LoadingState label="Loading article..." />
      </AppScreen>
    );
  }

  if (newsQuery.isError || !newsQuery.data) {
    return (
      <AppScreen scroll={false}>
        <ErrorState
          description="We couldn't load this article."
          onAction={() => void newsQuery.refetch()}
        />
      </AppScreen>
    );
  }

  const article = newsQuery.data;

  return (
    <AppScreen>
      <View style={styles.headerRow}>
        <AppButton variant="ghost" onPress={() => router.back()}>
          Back
        </AppButton>
        <AppButton variant="ghost" onPress={() => Share.share({ message: `${article.title}\n\n${stripHtml(article.bodyHtml).slice(0, 200)}...`, title: article.title })}>
          Share
        </AppButton>
      </View>

      {article.imageUrl ? (
        <Image source={{ uri: article.imageUrl }} style={[styles.heroImage, { backgroundColor: colors.surfaceMuted }]} />
      ) : null}

      <Text style={[styles.date, { color: colors.textMuted }]}>
        {formatDate(article.publishedAt || article.createdAt)}
      </Text>

      <Text style={[styles.title, { color: colors.text }]}>{article.title}</Text>

      <View style={styles.body}>
        <Text style={[styles.bodyText, { color: colors.text }]}>
          {stripHtml(article.bodyHtml)}
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
