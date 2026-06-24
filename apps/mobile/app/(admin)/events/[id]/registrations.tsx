import { useState } from 'react';
import { RefreshControl, StyleSheet, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { EmptyState } from '@/components/feedback/EmptyState';
import { ErrorState } from '@/components/feedback/ErrorState';
import { LoadingState } from '@/components/feedback/LoadingState';
import { RegistrationCard } from '@/components/events/RegistrationCard';
import { AppButton } from '@/components/ui/AppButton';
import { AppScreen } from '@/components/ui/AppScreen';
import { AppTextInput } from '@/components/ui/AppTextInput';
import { useAdminEvent, useCancelRegistration, useEventRegistrations, useSearchRegistrations } from '@/features/events/useAdminEvents';
import { useUndoCheckIn } from '@/features/scanner/useUndoCheckIn';

export default function EventRegistrationsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [search, setSearch] = useState('');

  const { data: regs, isLoading, isError, refetch, isRefetching } = useEventRegistrations(id);
  const searchResults = useSearchRegistrations(id, search.length >= 2 ? search : undefined);
  const cancelMutation = useCancelRegistration(id);
  const undoMutation = useUndoCheckIn(id);

  const registrations = search.length >= 2 ? (searchResults.data?.registrations ?? []) : (regs?.registrations ?? []);

  return (
    <AppScreen
      refreshControl={
        <RefreshControl refreshing={isRefetching} onRefresh={() => refetch()} />
      }
    >
      <AppButton variant="ghost" onPress={() => router.back()}>
        Back
      </AppButton>

      <AppTextInput
        value={search}
        onChangeText={setSearch}
        placeholder="Search by student name or number..."
      />

      {isLoading ? (
        <LoadingState label="Loading registrations..." />
      ) : isError ? (
        <ErrorState description="Could not load registrations." />
      ) : registrations.length === 0 ? (
        <EmptyState
          title="No registrations"
          description={search ? 'No matching registrations found.' : 'No students registered yet.'}
        />
      ) : (
        <View style={styles.list}>
          {registrations.map((reg) => (
            <RegistrationCard
              key={reg._id}
              registration={reg}
              onCancel={() => cancelMutation.mutate(reg._id)}
              onUndo={() => undoMutation.mutate(reg._id)}
              cancelPending={cancelMutation.isPending}
              undoPending={undoMutation.isPending}
            />
          ))}
        </View>
      )}
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: 8,
  },
});
