import { Alert, StyleSheet, Text, View } from 'react-native';

import { AppButton } from '@/components/ui/AppButton';
import { AppCard } from '@/components/ui/AppCard';
import { StatusPill } from '@/components/ui/StatusPill';
import { useTheme } from '@/theme/ThemeContext';
import { fontSizes, spacing } from '@/theme/tokens';
import { formatName } from '@/utils/format';
import type { StudentSummary } from '@/services/api/admin-students';

type Props = {
  student: StudentSummary;
  onToggleStatus?: () => void;
  togglePending?: boolean;
};

function InfoRow({ label, value }: { label: string; value?: string | null }) {
  const { colors } = useTheme();
  if (!value) return null;
  return (
    <View style={styles.row}>
      <Text style={[styles.label, { color: colors.textMuted }]}>{label}</Text>
      <Text style={[styles.value, { color: colors.text }]}>{value}</Text>
    </View>
  );
}

export function StudentProfileCard({ student, onToggleStatus, togglePending }: Props) {
  const { colors } = useTheme();
  const name = formatName(student.firstName, student.lastName);
  const initial = (student.firstName?.[0] ?? '?').toUpperCase();

  const handleToggle = () => {
    if (!onToggleStatus) return;
    const action = student.isActive ? 'Deactivate' : 'Activate';
    Alert.alert(`${action} Student`, `${action} ${name}?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: action, style: 'destructive', onPress: onToggleStatus },
    ]);
  };

  return (
    <>
      <AppCard variant="elevated">
        <View style={styles.profile}>
          <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
            <Text style={styles.avatarText}>{initial}</Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={[styles.name, { color: colors.text }]}>{name}</Text>
            <Text style={[styles.studentNumber, { color: colors.textMuted }]}>
              {student.studentNumber}
            </Text>
            <StatusPill
              label={student.status}
              tone={student.isActive ? 'success' : 'neutral'}
            />
          </View>
        </View>
      </AppCard>

      <AppCard>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Profile</Text>
        <InfoRow label="Email" value={student.email} />
        <InfoRow label="Phone" value={student.phone} />
        <InfoRow label="Address" value={student.address} />
      </AppCard>

      <AppCard>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Academic</Text>
        <InfoRow label="Program" value={student.programId?.name} />
        <InfoRow label="Year Level" value={student.yearLevelId?.label} />
        <InfoRow label="Section" value={student.sectionId?.displayName} />
      </AppCard>

      <AppCard>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Account</Text>
        <InfoRow label="QR Version" value={String(student.qrVersion ?? 1)} />
        <InfoRow label="Last Login" value={student.lastLoginAt ? new Date(student.lastLoginAt).toLocaleString() : undefined} />
        {onToggleStatus ? (
          <AppButton
            variant={student.isActive ? 'danger' : 'primary'}
            onPress={handleToggle}
            loading={togglePending}
            style={styles.toggleBtn}
          >
            {student.isActive ? 'Deactivate' : 'Activate'}
          </AppButton>
        ) : null}
      </AppCard>
    </>
  );
}

const styles = StyleSheet.create({
  profile: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '900',
  },
  profileInfo: {
    flex: 1,
    gap: 4,
  },
  name: {
    fontSize: fontSizes.lg,
    fontWeight: '900',
  },
  studentNumber: {
    fontSize: fontSizes.sm,
    fontWeight: '600',
  },
  row: {
    paddingVertical: spacing.xs,
    gap: 2,
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  value: {
    fontSize: fontSizes.sm,
  },
  sectionTitle: {
    fontSize: fontSizes.lg,
    fontWeight: '800',
    marginBottom: spacing.xs,
  },
  toggleBtn: {
    marginTop: spacing.sm,
  },
});
