import { zodResolver } from '@hookform/resolvers/zod';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { z } from 'zod';

import { ErrorState } from '@/components/feedback/ErrorState';
import { AppButton } from '@/components/ui/AppButton';
import { AppTextInput } from '@/components/ui/AppTextInput';
import type { LoginActorType } from '@/features/auth/useLoginMutation';
import { useLoginMutation } from '@/features/auth/useLoginMutation';
import { useTheme } from '@/theme/ThemeContext';
import { fontSizes, radii, spacing } from '@/theme/tokens';
import { getErrorMessage } from '@/utils/error';
import { hapticSuccess } from '@/utils/haptics';
import { getDefaultAdminRoute } from '@/utils/auth-profile';
import { useAuthStore } from '@/store/auth-store';

const loginSchema = z.object({
  identifier: z.string().min(3, 'Enter your student number or email.'),
  password: z.string().min(6, 'Enter your password.'),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const loginMutation = useLoginMutation();
  const [actorType, setActorType] = useState<LoginActorType>('student');

  const { control, handleSubmit, formState: { errors } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { identifier: '', password: '' },
  });

  const onSubmit = handleSubmit(async (values) => {
    await loginMutation.mutateAsync({ ...values, actorType });
    hapticSuccess();
    const adminProfile = useAuthStore.getState().adminProfile;
    router.replace(actorType === 'admin' ? (getDefaultAdminRoute(adminProfile) as never) : '/(tabs)/home');
  });

  return (
    <ScrollView style={[s.scroll, { backgroundColor: colors.background }]} contentContainerStyle={s.scrollContent} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
      <LinearGradient colors={['#6E29F6', '#4A1BB5', '#2E0F8A']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.header}>
        <Text style={s.brand}>CICT</Text>
        <Text style={s.tagline}>Mobile</Text>
        <Text style={s.description}>One app for student access and authorized admin tools.</Text>
      </LinearGradient>

      <View style={s.formSection}>
        <Text style={[s.formTitle, { color: colors.text }]}>Sign in</Text>
        <Text style={[s.formSubtitle, { color: colors.textMuted }]}>
          {actorType === 'admin'
            ? 'Use your admin credentials to manage permitted tools.'
            : 'Use your student credentials for events, attendance, and updates.'}
        </Text>

        <View style={[s.segmentedControl, { backgroundColor: colors.surfaceSoft, borderColor: colors.hairline }]}>
          {(['student', 'admin'] as const).map((mode) => {
            const isSelected = actorType === mode;
            return (
              <Pressable
                key={mode} accessibilityRole="button" accessibilityState={{ selected: isSelected }}
                onPress={() => setActorType(mode)}
                style={[s.segment, { backgroundColor: isSelected ? colors.background : 'transparent', borderColor: isSelected ? colors.hairlineStrong : 'transparent' }]}
              >
                <Text style={[s.segmentLabel, { color: isSelected ? colors.primary : colors.textMuted }]}>
                  {mode === 'student' ? 'Student' : 'Admin'}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <KeyboardAvoidingView behavior={Platform.select({ ios: 'padding', android: undefined })}>
          <Controller control={control} name="identifier"
            render={({ field: { onChange, value } }) => (
              <AppTextInput label={actorType === 'admin' ? 'Admin Email' : 'Student Number or Email'} value={value} onChangeText={onChange} autoCapitalize="none" autoCorrect={false} error={errors.identifier?.message} />
            )} />

          <Controller control={control} name="password"
            render={({ field: { onChange, value } }) => (
              <AppTextInput label="Password" value={value} onChangeText={onChange} secureTextEntry error={errors.password?.message} />
            )} />

          <Pressable onPress={() => router.push('/(auth)/forgot-password')} style={{ alignSelf: 'flex-end', marginTop: spacing.xs }}>
            <Text style={{ fontSize: fontSizes.xs, fontWeight: '600', color: colors.primary }}>Forgot Password?</Text>
          </Pressable>

          {loginMutation.isError ? (
            <ErrorState title="Login failed" description={getErrorMessage(loginMutation.error, 'Could not sign you in.')} />
          ) : null}

          <AppButton loading={loginMutation.isPending} onPress={onSubmit} style={{ marginTop: spacing.sm }}>
            {actorType === 'admin' ? 'Sign In as Admin' : 'Sign In as Student'}
          </AppButton>

          {actorType === 'student' ? (
            <View style={s.footer}>
              <Text style={{ fontSize: fontSizes.sm, color: colors.textMuted }}>Don&apos;t have an account? </Text>
              <Pressable onPress={() => router.push('/(auth)/register')}>
                <Text style={{ fontSize: fontSizes.sm, fontWeight: '700', color: colors.primary }}>Create Account</Text>
              </Pressable>
            </View>
          ) : null}
        </KeyboardAvoidingView>
      </View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  scroll: { flex: 1 },
  scrollContent: { flexGrow: 1 },
  header: { paddingTop: 60, paddingBottom: 28, paddingHorizontal: spacing.lg, gap: 4 },
  brand: { fontFamily: 'Blockletter', fontSize: 48, color: '#FFFFFF' },
  tagline: { fontSize: fontSizes.lg, fontWeight: '700', color: '#FFFFFF', opacity: 0.9 },
  description: { fontSize: fontSizes.sm, color: '#D4C5FF', lineHeight: 22, marginTop: spacing.xs },
  formSection: { flex: 1, padding: spacing.lg, paddingTop: spacing.xl, gap: spacing.md },
  formTitle: { fontSize: fontSizes.xl, fontWeight: '900' },
  formSubtitle: { fontSize: fontSizes.sm },
  segmentedControl: { borderWidth: 1, borderRadius: radii.md, flexDirection: 'row', padding: 4, gap: 4 },
  segment: { flex: 1, minHeight: 42, borderWidth: 1, borderRadius: radii.sm, alignItems: 'center', justifyContent: 'center' },
  segmentLabel: { fontSize: fontSizes.sm, fontWeight: '800' },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: spacing.lg },
});
