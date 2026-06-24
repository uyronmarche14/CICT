import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { AppButton } from '@/components/ui/AppButton';
import { AppCard } from '@/components/ui/AppCard';
import { StatusPill } from '@/components/ui/StatusPill';
import { useTheme } from '@/theme/ThemeContext';
import { fontSizes, spacing } from '@/theme/tokens';
import { formatDateTime, formatName } from '@/utils/format';
import type { ApprovalQueueItem } from '@/services/api/admin-approvals';

type Props = {
  item: ApprovalQueueItem;
  onApprove: () => void;
  onReject: () => void;
  approvePending?: boolean;
  rejectPending?: boolean;
};

const typeIcon: Record<string, keyof typeof Ionicons.glyphMap> = {
  event: 'calendar',
  news: 'newspaper',
  announcement: 'megaphone',
};

export function ApprovalCard({ item, onApprove, onReject, approvePending, rejectPending }: Props) {
  const { colors } = useTheme();
  const iconName = typeIcon[item.contentType] ?? 'document';
  const submitter = item.submittedBy
    ? formatName(item.submittedBy.firstName, item.submittedBy.lastName)
    : 'Unknown';

  return (
    <AppCard style={styles.card}>
      <View style={styles.header}>
        <Ionicons name={iconName} size={20} color={colors.primary} />
        <View style={styles.headerInfo}>
          <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
            {item.title}
          </Text>
          <Text style={[styles.meta, { color: colors.textMuted }]}>
            {submitter} • {formatDateTime(item.submittedAt)}
          </Text>
        </View>
        <StatusPill label={item.contentType} tone="neutral" />
      </View>

      {item.organizationName ? (
        <Text style={[styles.orgName, { color: colors.textMuted }]}>
          {item.organizationName}
        </Text>
      ) : null}

      <View style={styles.actions}>
        <View style={styles.actionBtn}>
          <AppButton
            onPress={onApprove}
            loading={approvePending}
            style={{ backgroundColor: colors.success, borderColor: colors.success }}
          >
            Approve
          </AppButton>
        </View>
        <View style={styles.actionBtn}>
          <AppButton
            onPress={onReject}
            loading={rejectPending}
            variant="danger"
          >
            Reject
          </AppButton>
        </View>
      </View>
    </AppCard>
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
  orgName: {
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
