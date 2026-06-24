import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AppCard } from '@/components/ui/AppCard';
import { StatusPill } from '@/components/ui/StatusPill';
import { useTheme } from '@/theme/ThemeContext';
import { fontSizes, spacing } from '@/theme/tokens';
import { formatName } from '@/utils/format';
import type { StudentSummary } from '@/services/api/admin-students';

type Props = {
  student: StudentSummary;
  onPress?: () => void;
};

export function StudentCard({ student, onPress }: Props) {
  const { colors } = useTheme();
  const name = formatName(student.firstName, student.lastName);
  const program = student.programId?.name ?? student.programId?.code ?? '';
  const year = student.yearLevelId?.label ?? '';
  const academic = [program, year].filter(Boolean).join(' • ');
  const initial = (student.firstName?.[0] ?? '?').toUpperCase();

  return (
    <Pressable onPress={onPress}>
      <AppCard style={styles.card}>
        <View style={styles.row}>
          <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
            <Text style={styles.avatarText}>{initial}</Text>
          </View>
          <View style={styles.info}>
            <Text style={[styles.name, { color: colors.text }]}>{name}</Text>
            <Text style={[styles.meta, { color: colors.textMuted }]}>
              {student.studentNumber}
            </Text>
            {academic ? (
              <Text style={[styles.meta, { color: colors.textMuted }]}>{academic}</Text>
            ) : null}
          </View>
          <StatusPill
            label={student.isActive ? 'Active' : 'Inactive'}
            tone={student.isActive ? 'success' : 'neutral'}
          />
        </View>
      </AppCard>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '900',
  },
  info: {
    flex: 1,
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
});
