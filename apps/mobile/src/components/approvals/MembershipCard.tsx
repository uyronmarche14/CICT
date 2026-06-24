import { StyleSheet, Text, View } from 'react-native';

import { AppButton } from '@/components/ui/AppButton';
import { AppCard } from '@/components/ui/AppCard';
import { useTheme } from '@/theme/ThemeContext';
import { fontSizes, spacing } from '@/theme/tokens';
import { formatDateTime, formatName } from '@/utils/format';
import type { PendingMembership } from '@/services/api/admin-approvals';

type Props = {
  membership: PendingMembership;
  onApprove: () => void;
  onReject: () => void;
  approvePending?: boolean;
  rejectPending?: boolean;
};

export function MembershipCard({ membership, onApprove, onReject, approvePending, rejectPending }: Props) {
  const { colors } = useTheme();
  const student = membership.studentId;
  const org = membership.organizationId;
  const name = student ? formatName(student.firstName, student.lastName) : 'Unknown';

  return (
    <AppCard style={styles.card}>
      <View style={styles.info}>
        <Text style={[styles.name, { color: colors.text }]}>{name}</Text>
        {student?.studentNumber ? (
          <Text style={[styles.meta, { color: colors.textMuted }]}>
            {student.studentNumber}
          </Text>
        ) : null}
        <Text style={[styles.meta, { color: colors.textMuted }]}>
          Wants to join {org?.name ?? 'an organization'}
        </Text>
        <Text style={[styles.meta, { color: colors.textMuted }]}>
          Applied {formatDateTime(membership.appliedAt)}
        </Text>
      </View>

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
  info: {
    gap: 2,
  },
  name: {
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
