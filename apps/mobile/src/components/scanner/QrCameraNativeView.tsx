import { CameraView, useCameraPermissions } from 'expo-camera';
import { Linking, StyleSheet, Text, View } from 'react-native';

import { LoadingState } from '@/components/feedback/LoadingState';
import { AppButton } from '@/components/ui/AppButton';
import { useTheme } from '@/theme/ThemeContext';
import { fontSizes, radii, spacing } from '@/theme/tokens';

import type { QrCameraViewProps } from './QrCameraView';

export function QrCameraNativeView({ scanning, enabled, onScan }: QrCameraViewProps) {
  const { colors } = useTheme();
  const [permission, requestPermission] = useCameraPermissions();

  if (!permission) {
    return <LoadingState label="Initializing camera..." />;
  }

  if (!permission.granted) {
    return (
      <View style={[styles.permissionPanel, { backgroundColor: colors.surfaceElevated }]}>
        <Text style={[styles.permissionTitle, { color: colors.text }]}>
          Camera permission required
        </Text>
        <Text style={[styles.permissionText, { color: colors.textMuted }]}>
          Attendance scanning needs camera access to read student QR passes.
        </Text>
        <AppButton onPress={requestPermission}>Grant Permission</AppButton>
        <AppButton variant="ghost" onPress={() => Linking.openSettings()}>
          Open Settings
        </AppButton>
      </View>
    );
  }

  return (
    <View style={styles.cameraContainer}>
      <CameraView
        style={styles.camera}
        facing="back"
        barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
        onBarcodeScanned={scanning && enabled ? (result) => onScan(result.data) : undefined}
      >
        <View style={styles.overlay}>
          <View style={[styles.scanArea, { borderColor: enabled ? colors.primary : colors.hairline }]} />
          <Text style={enabled ? styles.activeText : styles.pausedText}>
            {enabled ? 'Scanner active' : 'Camera paused'}
          </Text>
        </View>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  cameraContainer: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: radii.lg,
    overflow: 'hidden',
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.18)',
  },
  scanArea: {
    width: 210,
    height: 210,
    borderWidth: 4,
    borderRadius: radii.md,
  },
  activeText: {
    color: '#FFFFFF',
    fontSize: fontSizes.sm,
    fontWeight: '900',
    marginTop: spacing.md,
    textTransform: 'uppercase',
  },
  pausedText: {
    color: '#FFFFFF',
    fontSize: fontSizes.sm,
    fontWeight: '900',
    marginTop: spacing.md,
    textTransform: 'uppercase',
  },
  permissionPanel: {
    gap: spacing.sm,
    borderRadius: radii.md,
    padding: spacing.lg,
  },
  permissionTitle: {
    fontSize: fontSizes.md,
    fontWeight: '900',
    textAlign: 'center',
  },
  permissionText: {
    fontSize: fontSizes.sm,
    lineHeight: 20,
    textAlign: 'center',
  },
});
