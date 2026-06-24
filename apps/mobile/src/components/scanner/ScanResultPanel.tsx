import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { AppButton } from '@/components/ui/AppButton';
import type { ScanResult } from '@/services/api/admin-events';
import { useTheme } from '@/theme/ThemeContext';
import { fontSizes, radii, spacing } from '@/theme/tokens';
import { hapticError, hapticSuccess, hapticWarning } from '@/utils/haptics';

type ScanResultPanelProps = {
  result: ScanResult;
  studentName?: string;
  visible: boolean;
  onContinue: () => void;
  onUndo?: () => void;
  undoing?: boolean;
};

const resultConfig: Record<
  ScanResult,
  { tone: 'success' | 'info' | 'warning' | 'danger'; label: string; symbol: string }
> = {
  success: { tone: 'success', label: 'Checked in', symbol: 'OK' },
  duplicate: { tone: 'info', label: 'Already checked in', symbol: 'DUP' },
  not_registered: { tone: 'warning', label: 'Not registered', symbol: 'NO' },
  not_eligible: { tone: 'warning', label: 'Not eligible', symbol: 'NO' },
  event_full: { tone: 'danger', label: 'Event full', symbol: 'NO' },
  registration_closed: { tone: 'danger', label: 'Registration closed', symbol: 'NO' },
  invalid_qr: { tone: 'danger', label: 'Invalid QR', symbol: 'NO' },
  denied: { tone: 'danger', label: 'Entry denied', symbol: 'NO' },
};

export function ScanResultPanel({
  result,
  studentName,
  visible,
  onContinue,
  onUndo,
  undoing,
}: ScanResultPanelProps) {
  const { colors } = useTheme();
  const config = resultConfig[result];
  const backgroundColor = colors[config.tone];

  useEffect(() => {
    if (!visible) return;
    if (result === 'success') hapticSuccess();
    else if (result === 'duplicate') hapticWarning();
    else hapticError();
  }, [result, visible]);

  if (!visible) {
    return null;
  }

  return (
    <View style={[styles.panel, { backgroundColor }]}>
      <Text style={styles.symbol}>{config.symbol}</Text>
      <Text style={styles.label}>{config.label}</Text>
      {studentName ? <Text style={styles.studentName}>{studentName}</Text> : null}
      <View style={styles.actions}>
        <AppButton
          onPress={onContinue}
          style={{ backgroundColor: 'rgba(255,255,255,0.22)', borderColor: 'rgba(255,255,255,0.38)' }}
        >
          Continue
        </AppButton>
        {result === 'success' && onUndo ? (
          <AppButton variant="ghost" onPress={onUndo} loading={undoing}>
            Undo
          </AppButton>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    borderRadius: radii.lg,
    gap: spacing.sm,
    padding: spacing.lg,
  },
  symbol: {
    color: '#FFFFFF',
    fontSize: fontSizes.xl,
    fontWeight: '900',
  },
  label: {
    color: '#FFFFFF',
    fontSize: fontSizes.xl,
    fontWeight: '900',
  },
  studentName: {
    color: '#FFFFFF',
    fontSize: fontSizes.lg,
    fontWeight: '800',
    opacity: 0.92,
  },
  actions: {
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
});
