import { useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';

import { EmptyState } from '@/components/feedback/EmptyState';
import { LoadingState } from '@/components/feedback/LoadingState';
import { AppCard } from '@/components/ui/AppCard';
import { AppScreen } from '@/components/ui/AppScreen';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { useStudentProfile } from '@/features/profile/useStudentProfile';
import { useTheme } from '@/theme/ThemeContext';
import { fontSizes, radii, spacing } from '@/theme/tokens';
import { formatName } from '@/utils/format';
import { Ionicons } from '@expo/vector-icons';

export default function QrScreen() {
  const { colors } = useTheme();
  const profileQuery = useStudentProfile();
  const scale = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scale, {
      toValue: 0.97,
      useNativeDriver: true,
      speed: 50,
      bounciness: 4,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      speed: 50,
      bounciness: 4,
    }).start();
  };

  if (profileQuery.isPending && !profileQuery.data) {
    return (
      <AppScreen scroll={false}>
        <LoadingState label="Loading your pass..." />
      </AppScreen>
    );
  }

  const student = profileQuery.data;
  if (!student) {
    return (
      <AppScreen scroll={false}>
        <EmptyState
          title="No student profile"
          description="Your profile could not be loaded. Try signing in again."
        />
      </AppScreen>
    );
  }

  const qrPayload = JSON.stringify({
    type: 'student_pass',
    studentNumber: student.studentNumber,
    name: formatName(student.firstName, student.lastName),
    timestamp: Date.now(),
  });

  return (
    <AppScreen>
        <SectionHeader
          title="Your QR Pass"
          subtitle="Scan this at events to check in for attendance."
        />

        <AppCard variant="elevated">
          <View style={styles.passContainer}>
            <Pressable
              onPressIn={handlePressIn}
              onPressOut={handlePressOut}
              accessibilityLabel="Your attendance QR pass"
            >
              <Animated.View
                style={[
                  styles.qrWrapper,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.hairline,
                    transform: [{ scale }],
                  },
                ]}
              >
                <QRCode value={qrPayload} size={220} backgroundColor="transparent" color={colors.text} />
              </Animated.View>
            </Pressable>

            <View style={styles.passDetails}>
              <View style={styles.passInfoRow}>
                <Ionicons name="person" size={16} color={colors.textMuted} />
                <Text style={[styles.passName, { color: colors.text }]}>
                  {formatName(student.firstName, student.lastName)}
                </Text>
              </View>
              <View style={styles.passInfoRow}>
                <Ionicons name="card" size={16} color={colors.textMuted} />
                <Text style={[styles.passNumber, { color: colors.textMuted }]}>
                  {student.studentNumber}
                </Text>
              </View>
            </View>
          </View>
        </AppCard>

        <AppCard>
          <Text style={[styles.tipTitle, { color: colors.text }]}>How to use</Text>
          <View style={styles.tipRow}>
            <Ionicons name="checkmark-circle" size={20} color={colors.success} />
            <Text style={[styles.tipText, { color: colors.textMuted }]}>
              Present this QR code to event staff during registration or check-in.
            </Text>
          </View>
          <View style={styles.tipRow}>
            <Ionicons name="time" size={20} color={colors.warning} />
            <Text style={[styles.tipText, { color: colors.textMuted }]}>
              This pass refreshes periodically. If scanning fails, pull down to reload.
            </Text>
          </View>
          <View style={styles.tipRow}>
            <Ionicons name="shield-checkmark" size={20} color={colors.info} />
            <Text style={[styles.tipText, { color: colors.textMuted }]}>
              Only authorized event staff can scan and validate your pass.
            </Text>
          </View>
        </AppCard>
      </AppScreen>
  );
}

const styles = StyleSheet.create({
  passContainer: {
    alignItems: 'center',
    gap: spacing.lg,
    paddingVertical: spacing.md,
  },
  qrWrapper: {
    padding: spacing.md,
    borderRadius: radii.lg,
    borderWidth: 2,
  },
  passDetails: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  passInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  passName: {
    fontSize: fontSizes.lg,
    fontWeight: '800',
  },
  passNumber: {
    fontSize: fontSizes.md,
    fontWeight: '700',
  },
  tipTitle: {
    fontSize: fontSizes.md,
    fontWeight: '800',
    marginBottom: spacing.sm,
  },
  tipRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  tipText: {
    fontSize: fontSizes.sm,
    lineHeight: 20,
    flex: 1,
  },
});
