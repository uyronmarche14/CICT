import { useCallback, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { AdminModuleScreen } from '@/components/admin/AdminModuleScreen';
import { ManualEntryInput } from '@/components/scanner/ManualEntryInput';
import { QrCameraView } from '@/components/scanner/QrCameraView';
import { RecentCheckIns } from '@/components/scanner/RecentCheckIns';
import { ScanResultPanel } from '@/components/scanner/ScanResultPanel';
import { AppButton } from '@/components/ui/AppButton';
import { useAdminEvent } from '@/features/events/useAdminEvents';
import { useRecentScans } from '@/features/scanner/useRecentScans';
import { useScanAttendance } from '@/features/scanner/useScanAttendance';
import { useUndoCheckIn } from '@/features/scanner/useUndoCheckIn';
import type { ScanResponseData } from '@/services/api/admin-events';
import { useTheme } from '@/theme/ThemeContext';
import { fontSizes, spacing } from '@/theme/tokens';
import { getErrorMessage } from '@/utils/error';
import { formatDate } from '@/utils/format';
import { hapticSuccess } from '@/utils/haptics';

export default function ScannerDetailScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const eventId = Array.isArray(id) ? id[0] : id;

  const eventQuery = useAdminEvent(eventId);
  const scanMutation = useScanAttendance(eventId);
  const undoMutation = useUndoCheckIn(eventId);
  const recentScansQuery = useRecentScans(eventId);

  const [scanning, setScanning] = useState(true);
  const [resultVisible, setResultVisible] = useState(false);
  const [lastResult, setLastResult] = useState<ScanResponseData | null>(null);

  const logs = recentScansQuery.data?.logs ?? [];
  const summary = recentScansQuery.data?.summary;
  const totalCheckedIn = summary?.byResult?.success ?? 0;
  const totalDuplicates = summary?.byResult?.duplicate ?? 0;

  const showResult = useCallback((result: ScanResponseData) => {
    setLastResult(result);
    setResultVisible(true);
  }, []);

  const handleBarcodeScanned = useCallback(
    async (data: string) => {
      setScanning(false);
      try {
        const result = await scanMutation.mutateAsync({ qrToken: data });
        showResult(result);
      } catch (error) {
        Alert.alert('Check-in failed', getErrorMessage(error));
        setScanning(true);
      }
    },
    [scanMutation, showResult]
  );

  const handleManualSubmit = useCallback(
    async (studentNumber: string) => {
      try {
        const result = await scanMutation.mutateAsync({ studentNumber });
        hapticSuccess();
        showResult(result);
      } catch (error) {
        Alert.alert('Check-in failed', getErrorMessage(error));
      }
    },
    [scanMutation, showResult]
  );

  const handleContinue = useCallback(() => {
    setResultVisible(false);
    setLastResult(null);
    setScanning(true);
  }, []);

  const handleUndoRegistration = useCallback(
    async (registrationId: string) => {
      try {
        await undoMutation.mutateAsync(registrationId);
        hapticSuccess();
        handleContinue();
      } catch (error) {
        Alert.alert('Undo failed', getErrorMessage(error));
      }
    },
    [handleContinue, undoMutation]
  );

  const handleUndoRecent = useCallback(
    (registrationId: string) => {
      Alert.alert('Undo check-in', 'Remove this attendance check-in?', [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Undo',
          style: 'destructive',
          onPress: () => {
            handleUndoRegistration(registrationId);
          },
        },
      ]);
    },
    [handleUndoRegistration]
  );

  return (
    <AdminModuleScreen
      moduleKey="scanner"
      title="Scanner"
      subtitle="Scan QR passes or check in by student number."
    >
      <View style={styles.headerRow}>
        <AppButton variant="ghost" onPress={() => router.back()}>
          Back
        </AppButton>
        <View style={styles.headerInfo}>
          <Text style={[styles.eventTitle, { color: colors.text }]}>
            {eventQuery.data?.title ?? 'Event'}
          </Text>
          {eventQuery.data ? (
            <Text style={[styles.eventMeta, { color: colors.textMuted }]}>
              {formatDate(eventQuery.data.startDate)} | {eventQuery.data.location}
            </Text>
          ) : null}
        </View>
      </View>

      <QrCameraView scanning={scanning} onScan={handleBarcodeScanned} enabled={!resultVisible} />

      <ManualEntryInput onSubmit={handleManualSubmit} loading={scanMutation.isPending} />

      {lastResult ? (
        <ScanResultPanel
          result={lastResult.result}
          studentName={lastResult.studentName}
          visible={resultVisible}
          onContinue={handleContinue}
          onUndo={
            lastResult.result === 'success' && lastResult.registration?._id
              ? () => handleUndoRegistration(lastResult.registration!._id)
              : undefined
          }
          undoing={undoMutation.isPending}
        />
      ) : null}

      <RecentCheckIns
        logs={logs}
        onUndo={handleUndoRecent}
        undoing={undoMutation.isPending}
        totalCheckedIn={totalCheckedIn}
        totalDuplicates={totalDuplicates}
      />
    </AdminModuleScreen>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: spacing.sm,
  },
  headerInfo: {
    flex: 1,
    gap: 2,
  },
  eventTitle: {
    fontSize: fontSizes.md,
    fontWeight: '900',
  },
  eventMeta: {
    fontSize: fontSizes.xs,
    fontWeight: '700',
    lineHeight: 18,
  },
});
