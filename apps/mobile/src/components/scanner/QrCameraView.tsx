import { Component, lazy, ReactNode, Suspense, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { LoadingState } from '@/components/feedback/LoadingState';
import { AppButton } from '@/components/ui/AppButton';
import { useTheme } from '@/theme/ThemeContext';
import { fontSizes, radii, spacing } from '@/theme/tokens';

export type QrCameraViewProps = {
  scanning: boolean;
  enabled: boolean;
  onScan: (data: string) => void;
};

const NativeQrCameraView = lazy(async () => {
  const module = await import('./QrCameraNativeView');
  return { default: module.QrCameraNativeView };
});

export function QrCameraView(props: QrCameraViewProps) {
  const [retryKey, setRetryKey] = useState(0);

  return (
    <CameraRuntimeBoundary
      resetKey={retryKey}
      fallback={() => <CameraUnavailable onRetry={() => setRetryKey((key) => key + 1)} />}
    >
      <Suspense fallback={<LoadingState label="Initializing camera..." />}>
        <NativeQrCameraView {...props} />
      </Suspense>
    </CameraRuntimeBoundary>
  );
}

type CameraRuntimeBoundaryProps = {
  children: ReactNode;
  fallback: () => ReactNode;
  resetKey: number;
};

type CameraRuntimeBoundaryState = {
  hasError: boolean;
};

class CameraRuntimeBoundary extends Component<
  CameraRuntimeBoundaryProps,
  CameraRuntimeBoundaryState
> {
  state: CameraRuntimeBoundaryState = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidUpdate(previousProps: CameraRuntimeBoundaryProps) {
    if (previousProps.resetKey !== this.props.resetKey && this.state.hasError) {
      this.setState({ hasError: false });
    }
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback();
    }

    return this.props.children;
  }
}

function CameraUnavailable({ onRetry }: { onRetry: () => void }) {
  const { colors } = useTheme();

  return (
    <View
      style={[
        styles.unavailablePanel,
        { backgroundColor: colors.surfaceElevated, borderColor: colors.hairline },
      ]}
    >
      <Text style={[styles.unavailableTitle, { color: colors.text }]}>
        Camera runtime unavailable
      </Text>
      <Text style={[styles.unavailableText, { color: colors.textMuted }]}>
        The installed Android app does not include ExpoCamera. Rebuild and reinstall the
        development client, then reload this screen.
      </Text>
      <AppButton variant="secondary" onPress={onRetry} style={styles.retryButton}>
        Try Again
      </AppButton>
    </View>
  );
}

const styles = StyleSheet.create({
  unavailablePanel: {
    width: '100%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    borderRadius: radii.lg,
    borderWidth: 1,
    padding: spacing.lg,
  },
  unavailableTitle: {
    fontSize: fontSizes.md,
    fontWeight: '900',
    textAlign: 'center',
  },
  unavailableText: {
    fontSize: fontSizes.sm,
    lineHeight: 20,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: spacing.xs,
    minWidth: 160,
  },
});
