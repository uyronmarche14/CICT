import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { HeaderIconButton } from '@/components/navigation/header-icon-button';
import { useTheme } from '@/theme/ThemeContext';
import { fontSizes, spacing } from '@/theme/tokens';

type AppHeaderProps = {
  role: 'student' | 'admin';
};

export function AppHeader({ role }: AppHeaderProps) {
  const { colors } = useTheme();
  const router = useRouter();
  const { top } = useSafeAreaInsets();

  const isAdmin = role === 'admin';

  return (
    <View
      style={[
        styles.header,
        {
          backgroundColor: colors.canvas,
          paddingTop: top + spacing.xs,
        },
      ]}
    >
      <HeaderIconButton
        icon="person-outline"
        accessibilityLabel={isAdmin ? 'Admin profile' : 'Your profile'}
        onPress={() => router.push(isAdmin ? '/(admin)/settings' : '/(tabs)/profile')}
      />
      <View style={styles.center}>
        <Text style={[styles.brandText, { color: colors.primary }]}>
          CICT Mobile
        </Text>
      </View>
      <HeaderIconButton
        icon={isAdmin ? 'settings-outline' : 'qr-code-outline'}
        accessibilityLabel={isAdmin ? 'Settings' : 'QR Scanner'}
        onPress={() => router.push(isAdmin ? '/(admin)/settings' : '/(tabs)/qr')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  brandText: {
    fontFamily: 'Blockletter',
    fontSize: fontSizes.lg,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
});
