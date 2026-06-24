import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppScreen } from '@/components/ui/AppScreen';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { ContentCard } from '@/components/content/ContentCard';
import { EmptyState } from '@/components/feedback/EmptyState';
import { ErrorState } from '@/components/feedback/ErrorState';
import { LoadingState } from '@/components/feedback/LoadingState';
import { StatusPill } from '@/components/ui/StatusPill';
import { useContentList, usePublishContent, useArchiveContent } from '@/features/content/useContent';
import { spacing } from '@/theme/tokens';

const TYPE_FILTERS = [
  { label: 'All', value: null as string | null },
  { label: 'News', value: 'news' },
  { label: 'Announcements', value: 'announcement' },
] as const;

const STATUS_FILTERS = [
  { label: 'All', value: null as string | null },
  { label: 'Draft', value: 'draft' },
  { label: 'Pending', value: 'pending_approval' },
  { label: 'Approved', value: 'approved' },
  { label: 'Published', value: 'published' },
] as const;

export default function AdminContentScreen() {
  const [typeFilter, setTypeFilter] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);

  const { items, isLoading, isError, refetch } = useContentList({
    type: typeFilter ?? undefined,
    status: statusFilter ?? undefined,
  });

  const publishMutation = usePublishContent();
  const archiveMutation = useArchiveContent();

  const renderContent = () => {
    if (isLoading) return <LoadingState label="Loading content..." />;
    if (isError) return <ErrorState description="Could not load content." />;
    if (items.length === 0) {
      return (
        <EmptyState
          title="No content found"
          description="No news or announcements match the current filters."
        />
      );
    }
    return (
      <View style={styles.list}>
        {items.map((item) => (
          <ContentCard
            key={`${item.type}-${item._id}`}
            item={item}
            onPress={() => {}}
            onPublish={() => publishMutation.mutate({ type: item.type, id: item._id })}
            onArchive={() => archiveMutation.mutate({ type: item.type, id: item._id })}
            publishPending={publishMutation.isPending}
            archivePending={archiveMutation.isPending}
          />
        ))}
      </View>
    );
  };

  return (
    <AppScreen>
      <SectionHeader title="Content" subtitle="Review news and announcements." />

      <View style={styles.filterRow}>
        {TYPE_FILTERS.map((f) => (
          <Pressable key={f.value ?? 'all'} onPress={() => setTypeFilter(f.value)}>
            <StatusPill label={f.label} tone={typeFilter === f.value ? 'info' : 'neutral'} />
          </Pressable>
        ))}
      </View>

      <View style={styles.filterRow}>
        {STATUS_FILTERS.map((f) => (
          <Pressable key={f.value ?? 'all'} onPress={() => setStatusFilter(f.value)}>
            <StatusPill label={f.label} tone={statusFilter === f.value ? 'info' : 'neutral'} />
          </Pressable>
        ))}
      </View>

      {renderContent()}
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  list: {
    gap: spacing.sm,
  },
});
