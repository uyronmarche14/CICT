import * as Sharing from 'expo-sharing';

import { AppButton } from '@/components/ui/AppButton';
import { generateIcsContent, writeIcsFile } from '@/utils/ics';
import { hapticSuccess } from '@/utils/haptics';

export function AddToCalendarButton({
  event,
}: {
  event: { title: string; startDate: string; endDate: string; location?: string; excerpt?: string };
}) {
  const handleAdd = async () => {
    const content = generateIcsContent({
      title: event.title,
      startDate: event.startDate,
      endDate: event.endDate,
      location: event.location,
      description: event.excerpt,
    });

    const fileUri = await writeIcsFile(content);
    hapticSuccess();

    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(fileUri, {
        mimeType: 'text/calendar',
        dialogTitle: 'Add to Calendar',
      });
    }
  };

  return (
    <AppButton variant="secondary" onPress={handleAdd}>
      Add to Calendar
    </AppButton>
  );
}
