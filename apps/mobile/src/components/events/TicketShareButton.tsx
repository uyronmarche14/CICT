import { useRef, useCallback } from 'react';
import { View } from 'react-native';
import ViewShot from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';

import { AppButton } from '@/components/ui/AppButton';
import { hapticSuccess } from '@/utils/haptics';

export function TicketShareButton({ children }: { children: React.ReactNode }) {
  const viewShotRef = useRef<ViewShot>(null);

  const handleShare = useCallback(async () => {
    if (!viewShotRef.current) return;

    try {
      const uri = await viewShotRef.current?.capture?.();
      if (!uri) return;
      hapticSuccess();

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, {
          mimeType: 'image/png',
          dialogTitle: 'Share your ticket',
        });
      }
    } catch {}
  }, []);

  return (
    <>
      <View style={{ position: 'absolute', left: -9999 }} collapsable={false}>
        <ViewShot ref={viewShotRef} options={{ format: 'png', quality: 0.9 }}>
          {children}
        </ViewShot>
      </View>
      <AppButton variant="secondary" onPress={handleShare}>
        Share ticket
      </AppButton>
    </>
  );
}
