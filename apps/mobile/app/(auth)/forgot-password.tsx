import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { AppButton } from '@/components/ui/AppButton';
import { AppTextInput } from '@/components/ui/AppTextInput';
import { useTheme } from '@/theme/ThemeContext';
import { fontSizes, spacing } from '@/theme/tokens';

export default function ForgotPasswordScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const [identifier, setIdentifier] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!identifier.trim()) {
      setError('Enter your email or student number.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      // TODO: Connect to forgot password API
      // await studentAuthApi.forgotPassword(identifier);
      setSent(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={{ flexGrow: 1 }}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <LinearGradient
        colors={['#6E29F6', '#4A1BB5', '#2E0F8A']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={s.header}
      >
        <Text style={s.brand}>CICT</Text>
        <Text style={s.tagline}>Mobile</Text>
        <Text style={s.description}>Recover access to your account.</Text>
      </LinearGradient>

      <View style={s.formSection}>
        <Text style={{ fontSize: fontSizes.xl, fontWeight: '900', color: colors.text }}>Forgot Password?</Text>
        <Text style={{ fontSize: fontSizes.sm, color: colors.textMuted }}>
          Enter your email or student number and we will send instructions to help you recover your account.
        </Text>

        {sent ? (
          <View style={{ padding: spacing.lg, gap: spacing.md, alignItems: 'center' }}>
            <Ionicons name="checkmark-circle" size={48} color={colors.success} />
            <Text style={{ fontSize: fontSizes.md, fontWeight: '600', color: colors.text, textAlign: 'center' }}>
              Check your email for recovery instructions.
            </Text>
            <Pressable onPress={() => router.replace('/(auth)/login')}>
              <Text style={{ fontSize: fontSizes.sm, fontWeight: '700', color: colors.primary }}>Back to Sign In</Text>
            </Pressable>
          </View>
        ) : (
          <KeyboardAvoidingView behavior={Platform.select({ ios: 'padding', android: undefined })}>
            <AppTextInput
              label="Email or Student Number"
              value={identifier}
              onChangeText={(text) => { setIdentifier(text); setError(''); }}
              placeholder="you@example.com or 2024-00001"
              autoCapitalize="none"
              autoCorrect={false}
              error={error}
            />
            <AppButton loading={loading} onPress={handleSubmit} style={{ marginTop: spacing.md }}>
              Send Recovery Instructions
            </AppButton>
            <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: spacing.lg }}>
              <Pressable onPress={() => router.replace('/(auth)/login')}>
                <Text style={{ fontSize: fontSizes.sm, fontWeight: '700', color: colors.primary }}>Back to Sign In</Text>
              </Pressable>
            </View>
          </KeyboardAvoidingView>
        )}
      </View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  header: { paddingTop: 60, paddingBottom: 28, paddingHorizontal: spacing.lg, gap: 4 },
  brand: { fontFamily: 'Blockletter', fontSize: 48, color: '#FFFFFF' },
  tagline: { fontSize: fontSizes.lg, fontWeight: '700', color: '#FFFFFF', opacity: 0.9 },
  description: { fontSize: fontSizes.sm, color: '#D4C5FF', lineHeight: 22, marginTop: spacing.xs },
  formSection: { flex: 1, padding: spacing.lg, paddingTop: spacing.xl, gap: spacing.md },
});
