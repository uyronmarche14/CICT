import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { EmptyState } from '@/components/feedback/EmptyState';
import { ErrorState } from '@/components/feedback/ErrorState';
import { LoadingState } from '@/components/feedback/LoadingState';
import { AppButton } from '@/components/ui/AppButton';
import { AppCard } from '@/components/ui/AppCard';
import { AppScreen } from '@/components/ui/AppScreen';
import { StatusPill } from '@/components/ui/StatusPill';
import { useCastBallot, useVoteDetail } from '@/features/votes/useVotes';
import { useTheme } from '@/theme/ThemeContext';
import { fontSizes, radii, spacing } from '@/theme/tokens';
import { getErrorMessage } from '@/utils/error';
import { Ionicons } from '@expo/vector-icons';

export default function OrgVoteScreen() {
  const { id, voteId } = useLocalSearchParams<{ id: string; voteId: string }>();
  const router = useRouter();
  const { colors } = useTheme();
  const voteQuery = useVoteDetail(id ?? '', voteId ?? '');
  const castMutation = useCastBallot(id ?? '');
  const [selectedByPosition, setSelectedByPosition] = useState<Record<string, string[]>>({});
  const [message, setMessage] = useState<string | null>(null);
  const [hasSubmitted, setHasSubmitted] = useState(false);

  const vote = voteQuery.data;
  const now = Date.now();
  const isOpen = vote
    ? vote.isActive && now >= new Date(vote.startDate).getTime() && now <= new Date(vote.endDate).getTime()
    : false;

  const selections = useMemo(
    () =>
      Object.entries(selectedByPosition)
        .filter(([, candidateIds]) => candidateIds.length > 0)
        .map(([position, candidateIds]) => ({ position, candidateIds })),
    [selectedByPosition]
  );

  const allPositionsSelected =
    vote?.positions.every((position) => selectedByPosition[position.title]?.length > 0) ?? false;

  const toggleCandidate = (positionTitle: string, candidateName: string, maxSelections: number) => {
    setSelectedByPosition((current) => {
      const currentSelections = current[positionTitle] ?? [];
      const isSelected = currentSelections.includes(candidateName);
      const nextSelections = isSelected
        ? currentSelections.filter((name) => name !== candidateName)
        : maxSelections === 1
          ? [candidateName]
          : [...currentSelections, candidateName].slice(0, maxSelections);

      return { ...current, [positionTitle]: nextSelections };
    });
  };

  const handleSubmit = async () => {
    if (!voteId || !allPositionsSelected) {
      return;
    }

    setMessage(null);
    try {
      await castMutation.mutateAsync({ voteId, selections });
      setHasSubmitted(true);
      setMessage('Your ballot has been submitted.');
    } catch (error) {
      setMessage(getErrorMessage(error, 'Could not submit your ballot.'));
    }
  };

  if (voteQuery.isPending) {
    return (
      <AppScreen scroll={false}>
        <LoadingState label="Loading ballot..." />
      </AppScreen>
    );
  }

  if (voteQuery.isError || !vote) {
    return (
      <AppScreen scroll={false}>
        <ErrorState
          description="We couldn't load this ballot."
          onAction={() => void voteQuery.refetch()}
        />
      </AppScreen>
    );
  }

  if (!vote.positions.length || !vote.candidates.length) {
    return (
      <AppScreen scroll={false}>
        <EmptyState
          title="Ballot unavailable"
          description="This vote does not have positions or candidates yet."
          actionLabel="Back to Organization"
          onAction={() => router.back()}
        />
      </AppScreen>
    );
  }

  return (
    <AppScreen scroll={false}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={18} color={colors.primary} />
          <Text style={[styles.backLabel, { color: colors.primary }]}>Organization</Text>
        </Pressable>

        <View style={styles.header}>
          <View style={styles.titleRow}>
            <Text style={[styles.title, { color: colors.text }]}>{vote.title}</Text>
            <StatusPill label={isOpen ? 'Open' : 'Closed'} tone={isOpen ? 'success' : 'neutral'} />
          </View>
          {vote.description ? (
            <Text style={[styles.description, { color: colors.textMuted }]}>
              {vote.description}
            </Text>
          ) : null}
          <Text style={[styles.dateText, { color: colors.textMuted }]}>
            {new Intl.DateTimeFormat('en', {
              month: 'short',
              day: 'numeric',
              hour: 'numeric',
              minute: '2-digit',
            }).format(new Date(vote.startDate))}{' '}
            to{' '}
            {new Intl.DateTimeFormat('en', {
              month: 'short',
              day: 'numeric',
              hour: 'numeric',
              minute: '2-digit',
            }).format(new Date(vote.endDate))}
          </Text>
        </View>

        {!isOpen ? (
          <AppCard variant="elevated">
            <Text style={[styles.noticeText, { color: colors.textMuted }]}>
              This ballot is not open for voting right now.
            </Text>
          </AppCard>
        ) : null}

        {vote.positions.map((position) => {
          const candidates = vote.candidates.filter((candidate) => candidate.position === position.title);
          const selected = selectedByPosition[position.title] ?? [];

          return (
            <AppCard key={position.title} variant="elevated" style={styles.positionCard}>
              <View style={styles.positionHeader}>
                <View>
                  <Text style={[styles.positionTitle, { color: colors.text }]}>
                    {position.title}
                  </Text>
                  <Text style={[styles.positionHelp, { color: colors.textMuted }]}>
                    Select up to {position.maxSelections}
                  </Text>
                </View>
                <Text style={[styles.positionCount, { color: colors.textMuted }]}>
                  {selected.length}/{position.maxSelections}
                </Text>
              </View>

              {candidates.map((candidate) => {
                const selectedCandidate = selected.includes(candidate.name);

                return (
                  <Pressable
                    key={`${position.title}-${candidate.name}`}
                    disabled={!isOpen || hasSubmitted}
                    onPress={() => toggleCandidate(position.title, candidate.name, position.maxSelections)}
                    style={[
                      styles.candidateRow,
                      {
                        borderColor: selectedCandidate ? colors.primary : colors.border,
                        backgroundColor: selectedCandidate ? colors.primary + '12' : colors.surface,
                      },
                    ]}
                  >
                    <View style={styles.candidateTextGroup}>
                      <Text style={[styles.candidateName, { color: colors.text }]}>
                        {candidate.name}
                      </Text>
                      {candidate.bio ? (
                        <Text style={[styles.candidateBio, { color: colors.textMuted }]} numberOfLines={2}>
                          {candidate.bio}
                        </Text>
                      ) : null}
                    </View>
                    <Ionicons
                      name={selectedCandidate ? 'checkmark-circle' : 'ellipse-outline'}
                      size={22}
                      color={selectedCandidate ? colors.primary : colors.textMuted}
                    />
                  </Pressable>
                );
              })}
            </AppCard>
          );
        })}

        {message ? (
          <Text style={[styles.message, { color: colors.textMuted }]}>{message}</Text>
        ) : null}

        <AppButton
          disabled={!isOpen || !allPositionsSelected || hasSubmitted}
          loading={castMutation.isPending}
          onPress={() => void handleSubmit()}
        >
          {hasSubmitted ? 'Ballot Submitted' : 'Submit Ballot'}
        </AppButton>
      </ScrollView>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: spacing.lg,
    padding: spacing.lg,
    paddingBottom: spacing.xxl * 2,
  },
  backButton: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  backLabel: {
    fontSize: fontSizes.sm,
    fontWeight: '800',
  },
  header: {
    gap: spacing.sm,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  title: {
    flex: 1,
    fontSize: fontSizes.xl,
    fontWeight: '900',
    lineHeight: 30,
  },
  description: {
    fontSize: fontSizes.sm,
    lineHeight: 21,
  },
  dateText: {
    fontSize: fontSizes.xs,
    fontWeight: '700',
  },
  noticeText: {
    fontSize: fontSizes.sm,
    lineHeight: 21,
  },
  positionCard: {
    gap: spacing.md,
  },
  positionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  positionTitle: {
    fontSize: fontSizes.lg,
    fontWeight: '900',
  },
  positionHelp: {
    fontSize: fontSizes.xs,
    fontWeight: '700',
  },
  positionCount: {
    fontSize: fontSizes.xs,
    fontWeight: '800',
  },
  candidateRow: {
    minHeight: 64,
    borderWidth: 1,
    borderRadius: radii.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    padding: spacing.md,
  },
  candidateTextGroup: {
    flex: 1,
    gap: 2,
  },
  candidateName: {
    fontSize: fontSizes.md,
    fontWeight: '800',
  },
  candidateBio: {
    fontSize: fontSizes.xs,
    lineHeight: 17,
  },
  message: {
    fontSize: fontSizes.sm,
    lineHeight: 20,
    textAlign: 'center',
  },
});
