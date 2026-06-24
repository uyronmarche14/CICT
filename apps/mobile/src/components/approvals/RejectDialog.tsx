import { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { AppButton } from '@/components/ui/AppButton';
import { AppTextInput } from '@/components/ui/AppTextInput';
import { useTheme } from '@/theme/ThemeContext';
import { fontSizes, spacing } from '@/theme/tokens';

type Props = {
  visible: boolean;
  title: string;
  onConfirm: (reason: string, comment?: string) => void;
  onCancel: () => void;
  loading?: boolean;
};

export function RejectDialog({ visible, title, onConfirm, onCancel, loading }: Props) {
  const { colors } = useTheme();
  const [reason, setReason] = useState('');
  const [comment, setComment] = useState('');

  const handleSubmit = () => {
    if (!reason.trim()) return;
    onConfirm(reason.trim(), comment.trim() || undefined);
    setReason('');
    setComment('');
  };

  const handleCancel = () => {
    setReason('');
    setComment('');
    onCancel();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.backdrop}>
        <View style={[styles.sheet, { backgroundColor: colors.surface }]}>
          <Text style={[styles.sheetTitle, { color: colors.text }]}>Reject Content</Text>
          <Text style={[styles.sheetSubtitle, { color: colors.textMuted }]}>
            You are rejecting: {title}
          </Text>

          <AppTextInput
            label="Reason *"
            value={reason}
            onChangeText={setReason}
            placeholder="Explain why this is being rejected..."
            multiline
            error={!reason.trim() && reason.length > 0 ? 'Reason is required' : undefined}
          />
          <Text style={[styles.charCount, { color: colors.textMuted }]}>
            {reason.length}/500
          </Text>

          <AppTextInput
            label="Comments (optional)"
            value={comment}
            onChangeText={setComment}
            placeholder="Additional notes..."
            multiline
          />

          <View style={styles.actions}>
            <AppButton variant="ghost" onPress={handleCancel}>
              Cancel
            </AppButton>
            <AppButton
              variant="danger"
              onPress={handleSubmit}
              loading={loading}
              disabled={!reason.trim()}
            >
              Submit Rejection
            </AppButton>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  sheet: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: spacing.lg,
    gap: spacing.md,
    maxHeight: '80%',
  },
  sheetTitle: {
    fontSize: fontSizes.xl,
    fontWeight: '900',
  },
  sheetSubtitle: {
    fontSize: fontSizes.sm,
  },
  charCount: {
    fontSize: fontSizes.xs,
    fontWeight: '600',
    textAlign: 'right',
    marginTop: -spacing.sm,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.sm,
  },
});
