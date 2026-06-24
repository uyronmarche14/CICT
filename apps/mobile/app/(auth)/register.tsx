import { Ionicons } from '@expo/vector-icons';
import { zodResolver } from '@hookform/resolvers/zod';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { z } from 'zod';

import { AppButton } from '@/components/ui/AppButton';
import { AppTextInput } from '@/components/ui/AppTextInput';
import { useTheme } from '@/theme/ThemeContext';
import { fontSizes, radii, spacing } from '@/theme/tokens';

const PROGRAMS = [
  { id: 'bs-cs', label: 'BS Computer Science' },
  { id: 'bs-is', label: 'BS Information Systems' },
];

const YEAR_LEVELS = [
  { id: '1', label: '1st Year' },
  { id: '2', label: '2nd Year' },
  { id: '3', label: '3rd Year' },
  { id: '4', label: '4th Year' },
];

const SECTIONS = [
  { id: 'a', label: 'Section A' },
  { id: 'b', label: 'Section B' },
  { id: 'c', label: 'Section C' },
  { id: 'd', label: 'Section D' },
];

const registerSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  studentNumber: z.string().min(1, 'Student number is required'),
  email: z.string().email('Enter a valid email address'),
  programId: z.string().min(1, 'Select your program'),
  yearLevelId: z.string().min(1, 'Select your year level'),
  sectionId: z.string().min(1, 'Select your section'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(1, 'Confirm your password'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

type RegisterForm = z.infer<typeof registerSchema>;

export default function RegisterScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const { control, handleSubmit, formState: { errors }, watch, setValue } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: { firstName: '', lastName: '', studentNumber: '', email: '', programId: '', yearLevelId: '', sectionId: '', password: '', confirmPassword: '' },
  });

  const onSubmit = handleSubmit(async (values) => {
    setSubmitError('');
    setLoading(true);
    try {
      // TODO: Connect to studentAuthApi.register(values)
      router.replace('/(auth)/login');
    } catch (err: unknown) {
      setSubmitError(err instanceof Error ? err.message : 'Registration failed.');
    } finally { setLoading(false); }
  });

  return (
    <ScrollView style={[s.scroll, { backgroundColor: colors.background }]} contentContainerStyle={s.scrollContent} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
      <LinearGradient colors={['#6E29F6', '#4A1BB5', '#2E0F8A']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.header}>
        <Text style={s.brand}>CICT</Text>
        <Text style={s.tagline}>Mobile</Text>
        <Text style={s.description}>Create your account to access campus services.</Text>
      </LinearGradient>
      <View style={s.formSection}>
        <Text style={[s.formTitle, { color: colors.text }]}>Create Account</Text>
        <Text style={[s.formSubtitle, { color: colors.textMuted }]}>Register your student profile to continue using CICT Mobile.</Text>
        <KeyboardAvoidingView behavior={Platform.select({ ios: 'padding', android: undefined })} style={{ gap: spacing.md }}>
          <View style={s.row}>
            <View style={{ flex: 1 }}>
              <Controller control={control} name="firstName" render={({ field: { onChange, value } }) => (<AppTextInput label="First Name" value={value} onChangeText={onChange} error={errors.firstName?.message} />)} />
            </View>
            <View style={{ flex: 1 }}>
              <Controller control={control} name="lastName" render={({ field: { onChange, value } }) => (<AppTextInput label="Last Name" value={value} onChangeText={onChange} error={errors.lastName?.message} />)} />
            </View>
          </View>
          <Controller control={control} name="studentNumber" render={({ field: { onChange, value } }) => (<AppTextInput label="Student Number" value={value} onChangeText={onChange} placeholder="e.g. 2024-00001" autoCapitalize="none" error={errors.studentNumber?.message} />)} />
          <Controller control={control} name="email" render={({ field: { onChange, value } }) => (<AppTextInput label="Email" value={value} onChangeText={onChange} placeholder="you@example.com" keyboardType="email-address" autoCapitalize="none" error={errors.email?.message} />)} />
          <View style={{ flex: 1 }}>
            <SelectField label="Program" value={watch('programId')} options={PROGRAMS} onSelect={(id) => setValue('programId', id)} placeholder="Select program" error={errors.programId?.message} colors={colors} />
          </View>
          <View style={s.row}>
            <View style={{ flex: 1 }}><SelectField label="Year Level" value={watch('yearLevelId')} options={YEAR_LEVELS} onSelect={(id) => setValue('yearLevelId', id)} placeholder="Select year" error={errors.yearLevelId?.message} colors={colors} /></View>
            <View style={{ flex: 1 }}><SelectField label="Section" value={watch('sectionId')} options={SECTIONS} onSelect={(id) => setValue('sectionId', id)} placeholder="Select section" error={errors.sectionId?.message} colors={colors} /></View>
          </View>
          <Controller control={control} name="password" render={({ field: { onChange, value } }) => (<View style={{ position: 'relative' }}><AppTextInput label="Password" value={value} onChangeText={onChange} secureTextEntry={!showPassword} autoCapitalize="none" error={errors.password?.message} /><EyeToggle visible={showPassword} onToggle={() => setShowPassword(!showPassword)} colors={colors} /></View>)} />
          <Controller control={control} name="confirmPassword" render={({ field: { onChange, value } }) => (<View style={{ position: 'relative' }}><AppTextInput label="Confirm Password" value={value} onChangeText={onChange} secureTextEntry={!showConfirm} autoCapitalize="none" error={errors.confirmPassword?.message} /><EyeToggle visible={showConfirm} onToggle={() => setShowConfirm(!showConfirm)} colors={colors} /></View>)} />
          {submitError ? <Text style={[s.submitError, { color: colors.danger }]}>{submitError}</Text> : null}
          <AppButton loading={loading} onPress={onSubmit}>Create Account</AppButton>
          <View style={s.footer}>
            <Text style={[s.footerText, { color: colors.textMuted }]}>Already have an account? </Text>
            <Pressable onPress={() => router.replace('/(auth)/login')}><Text style={[s.footerLink, { color: colors.primary }]}>Sign In</Text></Pressable>
          </View>
        </KeyboardAvoidingView>
      </View>
    </ScrollView>
  );
}

function SelectField({ label, value, options, onSelect, placeholder, error, colors }: {
  label: string; value: string; options: { id: string; label: string }[];
  onSelect: (id: string) => void; placeholder: string; error?: string; colors: any;
}) {
  const [open, setOpen] = useState(false);
  const selected = options.find((o) => o.id === value);
  return (
    <View style={{ gap: spacing.xs }}>
      <Text style={{ fontSize: fontSizes.sm, fontWeight: '600', color: colors.text }}>{label}</Text>
      <Pressable onPress={() => setOpen(true)} style={{ minHeight: 50, borderWidth: 1, borderRadius: radii.md, paddingHorizontal: spacing.md, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: colors.surfaceElevated, borderColor: open ? colors.primary : colors.hairline }}>
        <Text style={{ fontSize: fontSizes.md, flex: 1, color: selected ? colors.text : colors.textMuted }}>{selected?.label || placeholder}</Text>
        <Ionicons name="chevron-down" size={16} color={colors.textMuted} />
      </Pressable>
      {error ? <Text style={{ fontSize: fontSizes.xs, color: colors.danger }}>{error}</Text> : null}
      <Modal visible={open} transparent animationType="fade">
        <Pressable style={s.modalOverlay} onPress={() => setOpen(false)}>
          <View style={[s.modalContent, { backgroundColor: colors.background }]}>
            <Text style={[s.modalTitle, { color: colors.text }]}>{label}</Text>
            {options.map((option) => (
              <Pressable key={option.id} onPress={() => { onSelect(option.id); setOpen(false); }}
                style={[s.modalItem, { borderBottomColor: colors.hairline }, option.id === value && { backgroundColor: colors.surfaceSoft }]}>
                <Text style={[s.modalItemText, { color: colors.text }, option.id === value && { color: colors.primary, fontWeight: '700' }]}>{option.label}</Text>
                {option.id === value ? <Ionicons name="checkmark" size={20} color={colors.primary} /> : null}
              </Pressable>
            ))}
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

function EyeToggle({ visible, onToggle, colors }: { visible: boolean; onToggle: () => void; colors: any }) {
  return (
    <Pressable onPress={onToggle} style={{ position: 'absolute', right: 12, top: 34, zIndex: 10, padding: 4 }} accessibilityLabel={visible ? 'Hide password' : 'Show password'}>
      <Ionicons name={visible ? 'eye-off-outline' : 'eye-outline'} size={20} color={colors.textMuted} />
    </Pressable>
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
  row: { flexDirection: 'row', gap: spacing.sm },
  submitError: { fontSize: fontSizes.sm, textAlign: 'center' },
  footer: { flexDirection: 'row', justifyContent: 'center', paddingVertical: spacing.md },
  footerText: { fontSize: fontSizes.sm },
  footerLink: { fontSize: fontSizes.sm, fontWeight: '700' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', padding: spacing.xl },
  modalContent: { borderRadius: radii.xl, padding: spacing.lg, maxHeight: '60%' },
  modalTitle: { fontSize: fontSizes.lg, fontWeight: '700', marginBottom: spacing.md },
  modalItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: spacing.sm + 2, borderBottomWidth: 1 },
  modalItemText: { fontSize: fontSizes.md },
});
