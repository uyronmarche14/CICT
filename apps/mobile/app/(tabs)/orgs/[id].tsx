import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Image, ImageBackground, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { ErrorState } from '@/components/feedback/ErrorState';
import { LoadingState } from '@/components/feedback/LoadingState';
import { AppButton } from '@/components/ui/AppButton';
import { AppCard } from '@/components/ui/AppCard';
import { AppScreen } from '@/components/ui/AppScreen';
import { StatusPill } from '@/components/ui/StatusPill';
import { useApplyToOrg, useMyMemberships, useResignFromOrg } from '@/features/memberships/useMemberships';
import { useOrganization } from '@/features/orgs/useOrganizations';
import { useOrgVotes } from '@/features/votes/useVotes';
import { useTheme } from '@/theme/ThemeContext';
import { fontSizes, radii, spacing } from '@/theme/tokens';
import type { OrganizationMember } from '@/types/models';
import { getErrorMessage } from '@/utils/error';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';

function ValueChip({ label, color }: { label: string; color: string }) {
  return (
    <View style={[styles.chip, { backgroundColor: color + '18', borderColor: color + '40' }]}>
      <Text style={[styles.chipText, { color }]}>{label}</Text>
    </View>
  );
}

function MemberCard({ member, accentColor }: { member: OrganizationMember; accentColor: string }) {
  const [expanded, setExpanded] = useState(false);
  const { colors } = useTheme();

  return (
    <Pressable onPress={() => setExpanded(!expanded)} style={styles.memberCardOuter}>
      <View style={[styles.memberCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        {member.photo ? (
          <Image source={{ uri: member.photo }} style={styles.memberPhoto} />
        ) : (
          <View style={[styles.memberPhotoPlaceholder, { backgroundColor: accentColor + '30' }]}>
            <Text style={[styles.memberPhotoInitial, { color: accentColor }]}>
              {member.name[0]}
            </Text>
          </View>
        )}
        <View style={styles.memberInfo}>
          <Text style={[styles.memberName, { color: colors.text }]} numberOfLines={1}>
            {member.name}
          </Text>
          <Text style={[styles.memberPosition, { color: accentColor }]} numberOfLines={1}>
            {member.position}
          </Text>
        </View>
        {expanded && member.bio ? (
          <View style={[styles.memberBioContainer, { borderTopColor: colors.border }]}>
            <Text style={[styles.memberBio, { color: colors.textMuted }]}>{member.bio}</Text>
          </View>
        ) : null}
      </View>
    </Pressable>
  );
}

export default function OrgDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { colors } = useTheme();
  const orgQuery = useOrganization(id ?? '');
  const membershipsQuery = useMyMemberships();
  const votesQuery = useOrgVotes(id ?? '');
  const applyMutation = useApplyToOrg();
  const resignMutation = useResignFromOrg();
  const [membershipMessage, setMembershipMessage] = useState<string | null>(null);

  if (orgQuery.isPending) {
    return (
      <AppScreen scroll={false}>
        <LoadingState label="Loading organization..." />
      </AppScreen>
    );
  }

  if (orgQuery.isError || !orgQuery.data) {
    return (
      <AppScreen scroll={false}>
        <ErrorState
          description="We couldn't load this organization."
          onAction={() => void orgQuery.refetch()}
        />
      </AppScreen>
    );
  }

  const org = orgQuery.data;
  const accent = org.color?.primary || colors.primary;
  const membership = (membershipsQuery.data ?? []).find(
    (item) => item.organizationId === org.id
  );
  const membershipStatus = membership?.status ?? 'none';
  const membershipTone =
    membershipStatus === 'active'
      ? 'success'
      : membershipStatus === 'applied' || membershipStatus === 'invited'
        ? 'warning'
        : membershipStatus === 'rejected'
          ? 'danger'
          : membershipStatus === 'resigned'
            ? 'neutral'
            : 'info';

  const handleApply = async () => {
    setMembershipMessage(null);
    try {
      await applyMutation.mutateAsync(org.id);
      setMembershipMessage('Your application has been submitted.');
    } catch (error) {
      setMembershipMessage(getErrorMessage(error, 'Could not submit your application.'));
    }
  };

  const handleResign = async () => {
    if (!membership?._id) {
      return;
    }

    setMembershipMessage(null);
    try {
      await resignMutation.mutateAsync({ membershipId: membership._id, orgId: org.id });
      setMembershipMessage('You have left this organization.');
    } catch (error) {
      setMembershipMessage(getErrorMessage(error, 'Could not leave this organization.'));
    }
  };
  const now = Date.now();
  const visibleVotes = (votesQuery.data ?? [])
    .filter((vote) => vote.isActive)
    .sort((a, b) => new Date(a.endDate).getTime() - new Date(b.endDate).getTime())
    .slice(0, 3);

  return (
    <AppScreen scroll={false}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {org.banner ? (
          <ImageBackground source={{ uri: org.banner }} style={styles.hero} imageStyle={styles.heroImage}>
            <LinearGradient
              colors={['rgba(0,0,0,0.1)', 'rgba(0,0,0,0.85)']}
              locations={[0.2, 1]}
              style={styles.heroOverlay}
            >
              <View style={styles.heroContent}>
                <View style={styles.heroLogoRow}>
                  {org.logo ? (
                    <Image source={{ uri: org.logo }} style={styles.heroLogo} />
                  ) : (
                    <View style={[styles.heroLogoPlaceholder, { backgroundColor: accent }]}>
                      <Text style={styles.heroLogoInitial}>{org.name[0]}</Text>
                    </View>
                  )}
                  <View style={styles.heroBadge}>
                    <Text style={styles.heroBadgeText}>
                      Est. {org.established}
                    </Text>
                  </View>
                </View>
                <Text style={styles.heroTitle}>{org.fullName}</Text>
                <Text style={styles.heroSubtitle}>{org.description}</Text>
              </View>
            </LinearGradient>
          </ImageBackground>
        ) : (
          <LinearGradient
            colors={[accent, accent + 'CC']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.heroGradient}
          >
            <View style={styles.heroContent}>
              <View style={styles.heroLogoRow}>
                {org.logo ? (
                  <Image source={{ uri: org.logo }} style={styles.heroLogo} />
                ) : (
                  <View style={[styles.heroLogoPlaceholder, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
                    <Text style={styles.heroLogoInitialWhite}>{org.name[0]}</Text>
                  </View>
                )}
                <View style={[styles.heroBadge, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
                  <Text style={styles.heroBadgeText}>Est. {org.established}</Text>
                </View>
              </View>
              <Text style={styles.heroTitle}>{org.fullName}</Text>
              <Text style={styles.heroSubtitle}>{org.description}</Text>
            </View>
          </LinearGradient>
        )}

        <View style={styles.section}>
          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Ionicons name="people-outline" size={18} color={accent} />
              <Text style={[styles.metaText, { color: colors.text }]}>
                {org.members?.length ?? 0} members
              </Text>
            </View>
            <View style={styles.metaItem}>
              <Ionicons name="calendar-outline" size={18} color={accent} />
              <Text style={[styles.metaText, { color: colors.text }]}>
                Est. {org.established}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <AppCard variant="elevated" style={styles.membershipCard}>
            <View style={styles.membershipHeader}>
              <View style={styles.membershipTitleRow}>
                <Ionicons name="person-add-outline" size={18} color={accent} />
                <Text style={[styles.membershipTitle, { color: colors.text }]}>
                  Membership
                </Text>
              </View>
              <StatusPill
                label={membershipStatus === 'none' ? 'Not joined' : membershipStatus}
                tone={membershipTone}
              />
            </View>
            <Text style={[styles.membershipBody, { color: colors.textMuted }]}>
              {membershipStatus === 'active'
                ? `You are an active ${membership?.memberType ?? 'member'} of ${org.name}.`
                : membershipStatus === 'applied'
                  ? 'Your application is waiting for organization review.'
                  : membershipStatus === 'invited'
                    ? 'You have been invited to join this organization.'
                    : membershipStatus === 'rejected'
                      ? 'Your previous application was rejected. You may apply again if applications are open.'
                      : membershipStatus === 'resigned'
                        ? 'You previously left this organization. You may apply again if applications are open.'
                        : 'Apply to join this organization and wait for an officer or admin to review your application.'}
            </Text>
            {membershipMessage ? (
              <Text style={[styles.membershipMessage, { color: colors.textMuted }]}>
                {membershipMessage}
              </Text>
            ) : null}
            {membershipStatus === 'active' ? (
              <AppButton
                variant="danger"
                loading={resignMutation.isPending}
                onPress={() => void handleResign()}
              >
                Leave Organization
              </AppButton>
            ) : membershipStatus === 'applied' || membershipStatus === 'invited' ? (
              <AppButton variant="secondary" disabled>
                Review Pending
              </AppButton>
            ) : (
              <AppButton
                loading={applyMutation.isPending}
                onPress={() => void handleApply()}
              >
                Apply to Join
              </AppButton>
            )}
          </AppCard>
        </View>

        {org.longDescription ? (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>About</Text>
            <Text style={[styles.bodyText, { color: colors.textMuted }]}>
              {org.longDescription}
            </Text>
          </View>
        ) : null}

        {org.values && org.values.length > 0 ? (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Values</Text>
            <View style={styles.chipsRow}>
              {org.values.map((value) => (
                <ValueChip key={value} label={value} color={accent} />
              ))}
            </View>
          </View>
        ) : null}

        {org.mission || org.vision ? (
          <View style={styles.dualSection}>
            {org.mission ? (
              <AppCard variant="elevated" style={styles.halfCard}>
                <View style={styles.dualCardHeader}>
                  <Ionicons name="flag-outline" size={18} color={accent} />
                  <Text style={[styles.dualCardTitle, { color: colors.text }]}>Mission</Text>
                </View>
                <Text style={[styles.bodyText, { color: colors.textMuted }]}>{org.mission}</Text>
              </AppCard>
            ) : null}
            {org.vision ? (
              <AppCard variant="elevated" style={styles.halfCard}>
                <View style={styles.dualCardHeader}>
                  <Ionicons name="eye-outline" size={18} color={accent} />
                  <Text style={[styles.dualCardTitle, { color: colors.text }]}>Vision</Text>
                </View>
                <Text style={[styles.bodyText, { color: colors.textMuted }]}>{org.vision}</Text>
              </AppCard>
            ) : null}
          </View>
        ) : null}

        {org.achievements && org.achievements.length > 0 ? (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Achievements</Text>
            {org.achievements.map((achievement, idx) => (
              <View key={idx} style={[styles.achievementRow, { borderBottomColor: colors.border }]}>
                <View style={[styles.achievementIcon, { backgroundColor: accent + '18' }]}>
                  <Ionicons name="trophy-outline" size={16} color={accent} />
                </View>
                <Text style={[styles.achievementText, { color: colors.text }]}>{achievement}</Text>
              </View>
            ))}
          </View>
        ) : null}

        {visibleVotes.length > 0 ? (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Voting</Text>
            <Text style={[styles.sectionSubtitle, { color: colors.textMuted }]}>
              Active elections and polls for {org.name}
            </Text>
            {visibleVotes.map((vote) => {
              const startsAt = new Date(vote.startDate).getTime();
              const endsAt = new Date(vote.endDate).getTime();
              const hasStarted = now >= startsAt;
              const hasEnded = now > endsAt;
              const tone = hasEnded ? 'neutral' : hasStarted ? 'success' : 'warning';
              const statusLabel = hasEnded ? 'Ended' : hasStarted ? 'Open' : 'Upcoming';

              return (
                <AppCard key={vote._id} variant="elevated" style={styles.voteCard}>
                  <View style={styles.voteHeader}>
                    <View style={styles.voteTitleGroup}>
                      <Ionicons name="checkbox-outline" size={18} color={accent} />
                      <Text style={[styles.voteTitle, { color: colors.text }]} numberOfLines={2}>
                        {vote.title}
                      </Text>
                    </View>
                    <StatusPill label={statusLabel} tone={tone} />
                  </View>
                  {vote.description ? (
                    <Text style={[styles.bodyText, { color: colors.textMuted }]} numberOfLines={3}>
                      {vote.description}
                    </Text>
                  ) : null}
                  <View style={styles.voteMetaRow}>
                    <Text style={[styles.voteMeta, { color: colors.textMuted }]}>
                      {vote.positions.length} position{vote.positions.length === 1 ? '' : 's'}
                    </Text>
                    <Text style={[styles.voteMeta, { color: colors.textMuted }]}>
                      Ends {new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric' }).format(new Date(vote.endDate))}
                    </Text>
                  </View>
                  <AppButton
                    variant={hasStarted && !hasEnded ? 'primary' : 'secondary'}
                    onPress={() => router.push(`/(tabs)/orgs/${org.id}/votes/${vote._id}`)}
                  >
                    {hasStarted && !hasEnded ? 'Open Ballot' : 'View Details'}
                  </AppButton>
                </AppCard>
              );
            })}
          </View>
        ) : null}

        {org.members && org.members.length > 0 ? (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Team</Text>
            <Text style={[styles.sectionSubtitle, { color: colors.textMuted }]}>
              Meet the people behind {org.name}
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.membersScroll}
            >
              {org.members.map((member) => (
                <MemberCard key={member.id} member={member} accentColor={accent} />
              ))}
            </ScrollView>
          </View>
        ) : null}
      </ScrollView>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: spacing.xxl * 2,
  },
  hero: {
    height: 320,
  },
  heroImage: {
    borderBottomLeftRadius: radii.xl,
    borderBottomRightRadius: radii.xl,
  },
  heroOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    borderBottomLeftRadius: radii.xl,
    borderBottomRightRadius: radii.xl,
    overflow: 'hidden',
  },
  heroGradient: {
    height: 260,
    justifyContent: 'flex-end',
    borderBottomLeftRadius: radii.xl,
    borderBottomRightRadius: radii.xl,
  },
  heroContent: {
    padding: spacing.lg,
    gap: spacing.xs,
  },
  heroLogoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.sm,
  },
  heroLogo: {
    width: 64,
    height: 64,
    borderRadius: radii.md,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  heroLogoPlaceholder: {
    width: 64,
    height: 64,
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroLogoInitial: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '900',
  },
  heroLogoInitialWhite: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '900',
  },
  heroBadge: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radii.pill,
  },
  heroBadgeText: {
    color: '#FFFFFF',
    fontSize: fontSizes.xs,
    fontWeight: '700',
  },
  heroTitle: {
    color: '#FFFFFF',
    fontSize: 30,
    fontWeight: '900',
    lineHeight: 34,
  },
  heroSubtitle: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: fontSizes.sm,
    lineHeight: 20,
  },
  section: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    gap: spacing.sm,
  },
  sectionTitle: {
    fontSize: fontSizes.xl,
    fontWeight: '900',
  },
  sectionSubtitle: {
    fontSize: fontSizes.sm,
    marginTop: -4,
  },
  bodyText: {
    fontSize: fontSizes.sm,
    lineHeight: 22,
  },
  metaRow: {
    flexDirection: 'row',
    gap: spacing.xl,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    fontSize: fontSizes.sm,
    fontWeight: '600',
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  chip: {
    borderWidth: 1,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
  },
  chipText: {
    fontSize: fontSizes.xs,
    fontWeight: '700',
  },
  membershipCard: {
    gap: spacing.md,
  },
  membershipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  membershipTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  membershipTitle: {
    fontSize: fontSizes.md,
    fontWeight: '900',
  },
  membershipBody: {
    fontSize: fontSizes.sm,
    lineHeight: 21,
  },
  membershipMessage: {
    fontSize: fontSizes.xs,
    lineHeight: 18,
  },
  dualSection: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    gap: spacing.sm,
  },
  halfCard: {
    flex: 1,
  },
  dualCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: spacing.xs,
  },
  dualCardTitle: {
    fontSize: fontSizes.md,
    fontWeight: '800',
  },
  achievementRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
  },
  achievementIcon: {
    width: 32,
    height: 32,
    borderRadius: radii.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  achievementText: {
    fontSize: fontSizes.sm,
    fontWeight: '600',
    flex: 1,
  },
  membersScroll: {
    gap: spacing.sm,
    paddingTop: spacing.xs,
    paddingBottom: spacing.sm,
  },
  memberCardOuter: {
    width: 160,
  },
  memberCard: {
    borderRadius: radii.lg,
    borderWidth: 1,
    overflow: 'hidden',
    width: 160,
  },
  memberPhoto: {
    width: 160,
    height: 180,
    resizeMode: 'cover',
  },
  memberPhotoPlaceholder: {
    width: 160,
    height: 180,
    alignItems: 'center',
    justifyContent: 'center',
  },
  memberPhotoInitial: {
    fontSize: 48,
    fontWeight: '900',
  },
  memberInfo: {
    padding: spacing.sm,
    gap: 2,
  },
  memberName: {
    fontSize: fontSizes.sm,
    fontWeight: '800',
  },
  memberPosition: {
    fontSize: fontSizes.xs,
    fontWeight: '600',
  },
  memberBioContainer: {
    borderTopWidth: 1,
    padding: spacing.sm,
  },
  memberBio: {
    fontSize: fontSizes.xs,
    lineHeight: 16,
  },
  voteCard: {
    gap: spacing.md,
  },
  voteHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  voteTitleGroup: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  voteTitle: {
    flex: 1,
    fontSize: fontSizes.md,
    fontWeight: '900',
  },
  voteMetaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  voteMeta: {
    fontSize: fontSizes.xs,
    fontWeight: '700',
  },
});
