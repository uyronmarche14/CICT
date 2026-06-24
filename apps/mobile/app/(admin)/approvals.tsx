import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { AdminModuleScreen } from '@/components/admin/AdminModuleScreen';
import { ApprovalCard } from '@/components/approvals/ApprovalCard';
import { MembershipCard } from '@/components/approvals/MembershipCard';
import { RejectDialog } from '@/components/approvals/RejectDialog';
import { EmptyState } from '@/components/feedback/EmptyState';
import { ErrorState } from '@/components/feedback/ErrorState';
import { LoadingState } from '@/components/feedback/LoadingState';
import { StatusPill } from '@/components/ui/StatusPill';
import {
  useApproveContent,
  usePendingApprovals,
  usePendingMemberships,
  useRejectContent,
  useApproveMembership,
  useRejectMembership,
} from '@/features/approvals/useApprovals';
import { useTheme } from '@/theme/ThemeContext';
import { fontSizes, spacing } from '@/theme/tokens';

const TYPE_FILTERS = [
  { label: 'All', value: null as string | null },
  { label: 'Events', value: 'events' },
  { label: 'News', value: 'news' },
  { label: 'Members', value: 'members' },
] as const;

export default function AdminApprovalsScreen() {
  const { colors } = useTheme();
  const [typeFilter, setTypeFilter] = useState<string | null>(null);
  const [rejectTarget, setRejectTarget] = useState<{ contentType: string; contentId: string; title: string } | null>(null);

  const queueQuery = usePendingApprovals({ type: typeFilter === 'members' ? undefined : typeFilter ?? undefined });
  const membershipsQuery = usePendingMemberships();
  const approveMutation = useApproveContent();
  const rejectMutation = useRejectContent();
  const approveMembershipMutation = useApproveMembership();
  const rejectMembershipMutation = useRejectMembership();

  const showContent = typeFilter !== 'members';
  const showMembers = !typeFilter || typeFilter === 'members';

  const items = queueQuery.data?.items ?? [];
  const memberships = membershipsQuery.data ?? [];

  return (
    <AdminModuleScreen
      moduleKey="approvals"
      title="Approvals"
      subtitle="Approve or reject content and memberships."
    >
      <View style={styles.filterRow}>
        {TYPE_FILTERS.map((f) => (
          <Pressable key={f.value ?? 'all'} onPress={() => setTypeFilter(f.value)}>
            <StatusPill
              label={f.label}
              tone={typeFilter === f.value ? 'info' : 'neutral'}
            />
          </Pressable>
        ))}
      </View>

      {showContent ? (
        queueQuery.isLoading ? (
          <LoadingState label="Loading approvals..." />
        ) : queueQuery.isError ? (
          <ErrorState description="Could not load approval queue." />
        ) : items.length === 0 ? (
          <EmptyState
            title="No pending approvals"
            description="All content has been reviewed."
          />
        ) : (
          items.map((item) => (
            <ApprovalCard
              key={item._id}
              item={item}
              onApprove={() => approveMutation.mutate({ contentType: item.contentType, contentId: item.contentId })}
              onReject={() => setRejectTarget({ contentType: item.contentType, contentId: item.contentId, title: item.title })}
              approvePending={approveMutation.isPending}
              rejectPending={rejectMutation.isPending}
            />
          ))
        )
      ) : null}

      {showMembers && memberships.length > 0 ? (
        <>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Membership Applications
          </Text>
          {memberships.map((m) => (
            <MembershipCard
              key={m._id}
              membership={m}
              onApprove={() => approveMembershipMutation.mutate({ orgId: m.organizationId._id, membershipId: m._id })}
              onReject={() => rejectMembershipMutation.mutate({ orgId: m.organizationId._id, membershipId: m._id })}
              approvePending={approveMembershipMutation.isPending}
              rejectPending={rejectMembershipMutation.isPending}
            />
          ))}
        </>
      ) : null}

      <RejectDialog
        visible={!!rejectTarget}
        title={rejectTarget?.title ?? ''}
        loading={rejectMutation.isPending}
        onCancel={() => setRejectTarget(null)}
        onConfirm={(reason, comment) => {
          if (rejectTarget) {
            rejectMutation.mutate(
              { contentType: rejectTarget.contentType, contentId: rejectTarget.contentId, reason, comment },
              { onSuccess: () => setRejectTarget(null) }
            );
          }
        }}
      />
    </AdminModuleScreen>
  );
}

const styles = StyleSheet.create({
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  sectionTitle: {
    fontSize: fontSizes.lg,
    fontWeight: '800',
    marginTop: spacing.md,
  },
});
