import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { AppButton } from '@/components/ui/AppButton';
import { AppCard } from '@/components/ui/AppCard';
import { StatusPill } from '@/components/ui/StatusPill';
import { useTheme } from '@/theme/ThemeContext';
import { fontSizes, spacing } from '@/theme/tokens';
import { formatDateTime, formatName } from '@/utils/format';
import type { ContentItem } from '@/services/api/admin-content';

type Props = {
  item: ContentItem;
  onPress?: () => void;
  onPublish?: () => void;
  onArchive?: () => void;
  publishPending?: boolean;
  archivePending?: boolean;
};

const typeIcon: Record<string, keyof typeof Ionicons.glyphMap> = {
  news: 'newspaper',
  announcement: 'megaphone',
};

const statusAction: Record<string, { label: string; tone: 'success' | 'warning' | 'info' | 'neutral' | 'danger' }> = {
  draft: { label: 'Draft', tone: 'neutral' },
  pending_approval: { label: 'Pending', tone: 'warning' },
  approved: { label: 'Approved', tone: 'info' },
  published: { label: 'Published', tone: 'success' },
  archived: { label: 'Archived', tone: 'danger' },
};

export function ContentCard({ item, onPress, onPublish, onArchive, publishPending, archivePending }: Props) {
  const { colors } = useTheme();
  const iconName = typeIcon[item.type] ?? 'document';
  const status = statusAction[item.status] ?? { label: item.status, tone: 'neutral' as const };
  const author = item.author ? formatName(item.author.firstName, item.author.lastName) : null;

  return (
    <Pressable onPress={onPress}>
      <AppCard style={styles.card}>
        <View style={styles.header}>
          <Ionicons name={iconName} size={20} color={colors.primary} />
          <View style={styles.headerInfo}>
            <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
              {item.title}
            </Text>
            <Text style={[styles.meta, { color: colors.textMuted }]}>
              {formatDateTime(item.createdAt)}
              {author ? ` • ${author}` : ''}
            </Text>
          </View>
          <StatusPill label={status.label} tone={status.tone} />
        </View>

        <View style={styles.actions}>
          {item.status === 'approved' ? (
            <AppButton onPress={onPublish} loading={publishPending} style={styles.actionBtn}>
              Publish
            </AppButton>
          ) : null}
          {item.status === 'published' ? (
            <AppButton onPress={onArchive} loading={archivePending} variant="ghost" style={styles.actionBtn}>
              Archive
            </AppButton>
          ) : null}
        </View>
      </AppCard>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  headerInfo: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontSize: fontSizes.md,
    fontWeight: '800',
  },
  meta: {
    fontSize: fontSizes.xs,
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  actionBtn: {
    flex: 1,
  },
});
