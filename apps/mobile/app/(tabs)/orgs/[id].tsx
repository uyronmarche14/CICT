import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams } from 'expo-router';
import { Image, ImageBackground, ScrollView, StyleSheet, Text, View } from 'react-native';

import { ErrorState } from '@/components/feedback/ErrorState';
import { LoadingState } from '@/components/feedback/LoadingState';
import { AppCard } from '@/components/ui/AppCard';
import { AppScreen } from '@/components/ui/AppScreen';
import { useOrganization } from '@/features/orgs/useOrganizations';
import { useTheme } from '@/theme/ThemeContext';
import { fontSizes, radii, spacing } from '@/theme/tokens';
import type { OrganizationMember } from '@/types/models';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable } from 'react-native';

function ValueChip({ label, color }: { label: string; color: string }) {
  const { colors } = useTheme();
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
  const { colors, isDark } = useTheme();
  const orgQuery = useOrganization(id ?? '');

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
});
