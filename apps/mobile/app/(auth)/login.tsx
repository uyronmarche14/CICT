import { zodResolver } from '@hookform/resolvers/zod';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { z } from 'zod';

import { ErrorState } from '@/components/feedback/ErrorState';
import { AppButton } from '@/components/ui/AppButton';
import { AppTextInput } from '@/components/ui/AppTextInput';
import { useLoginMutation } from '@/features/auth/useLoginMutation';
import { useTheme } from '@/theme/ThemeContext';
import { fontSizes, spacing } from '@/theme/tokens';
import { getErrorMessage } from '@/utils/error';
import { hapticSuccess } from '@/utils/haptics';

const loginSchema = z.object({
  identifier: z.string().min(3, 'Enter your student number or email.'),
  password: z.string().min(6, 'Enter your password.'),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const loginMutation = useLoginMutation();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      identifier: '',
      password: '',
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    await loginMutation.mutateAsync(values);
    hapticSuccess();
    router.replace('/(tabs)/home');
  });

  return (
    <ScrollView
      style={[styles.scroll, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.scrollContent}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <LinearGradient
        colors={['#6E29F6', '#4A1BB5', '#2E0F8A']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <Text style={styles.brand}>CICT</Text>
        <Text style={styles.tagline}>Student Mobile</Text>
        <Text style={styles.description}>
          Check in, register, and stay connected.
        </Text>
      </LinearGradient>

      <View style={styles.formSection}>
        <Text style={[styles.formTitle, { color: colors.text }]}>Sign in</Text>
        <Text style={[styles.formSubtitle, { color: colors.textMuted }]}>
          Enter your student credentials.
        </Text>

        <KeyboardAvoidingView
          behavior={Platform.select({ ios: 'padding', android: undefined })}
        >
          <Controller
            control={control}
            name="identifier"
            render={({ field: { onChange, value } }) => (
              <AppTextInput
                label="Student Number or Email"
                value={value}
                onChangeText={onChange}
                autoCapitalize="none"
                autoCorrect={false}
                error={errors.identifier?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="password"
            render={({ field: { onChange, value } }) => (
              <AppTextInput
                label="Password"
                value={value}
                onChangeText={onChange}
                secureTextEntry
                error={errors.password?.message}
              />
            )}
          />

          {loginMutation.isError ? (
            <ErrorState
              title="Login failed"
              description={getErrorMessage(loginMutation.error, 'Could not sign you in.')}
            />
          ) : null}

          <AppButton loading={loginMutation.isPending} onPress={onSubmit} style={styles.signInButton}>
            Sign In
          </AppButton>
        </KeyboardAvoidingView>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 28,
    paddingHorizontal: spacing.lg,
    gap: 4,
  },
  brand: {
    fontFamily: 'Blockletter',
    fontSize: 48,
    color: '#FFFFFF',
    letterSpacing: 0.05,
  },
  tagline: {
    fontSize: fontSizes.lg,
    fontWeight: '700',
    color: '#FFFFFF',
    opacity: 0.9,
  },
  description: {
    fontSize: fontSizes.sm,
    color: '#D4C5FF',
    lineHeight: 22,
    marginTop: spacing.xs,
  },
  formSection: {
    flex: 1,
    padding: spacing.lg,
    paddingTop: spacing.xl,
    gap: spacing.md,
  },
  formTitle: {
    fontSize: fontSizes.xl,
    fontWeight: '900',
  },
  formSubtitle: {
    fontSize: fontSizes.sm,
  },
  signInButton: {
    marginTop: spacing.sm,
  },
});
