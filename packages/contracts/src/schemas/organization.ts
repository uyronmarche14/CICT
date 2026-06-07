import { z } from 'zod';
import type { OfficeLocation } from '../types/organization';
import type { SocialLink } from '../types/organization';
import type { AdviserItem } from '../types/organization';
import type { PartnerItem } from '../types/organization';
import type { CommitteeItem } from '../types/organization';
import type { OrganizationProgram } from '../types/organization';
import type { FlagshipEvent } from '../types/organization';
import type { ProjectItem } from '../types/organization';
import type { MilestoneItem } from '../types/organization';
import type { OrganizationAchievement } from '../types/organization';
import type { OrganizationMember } from '../types/organization';
import type { Organization } from '../types/organization';
import type { OrganizationMembership } from '../types/organization';
import type { MembershipHistoryEntry } from '../types/organization';
import type { MembershipContribution } from '../types/organization';
import { mediaAssetSchema } from './common';
import { membershipStatusSchema } from './organization-enums';
import { memberTypeSchema } from './organization-enums';
import { organizationTypeSchema } from './organization-enums';

export const officeLocationSchema: z.ZodType<OfficeLocation> = z.object({
  building: z.string().optional(),
  room: z.string().optional(),
  campus: z.string().optional(),
  mapUrl: z.string().optional(),
});

export const socialLinkSchema: z.ZodType<SocialLink> = z.object({
  platform: z.string(),
  url: z.string(),
  label: z.string().optional(),
});

export const adviserItemSchema: z.ZodType<AdviserItem> = z.object({
  name: z.string(),
  role: z.string().optional(),
  email: z.string().optional(),
  photo: z.string().optional(),
});

export const partnerItemSchema: z.ZodType<PartnerItem> = z.object({
  name: z.string(),
  logo: z.string().optional(),
  website: z.string().optional(),
  description: z.string().optional(),
  partnershipType: z.string().optional(),
});

export const committeeItemSchema: z.ZodType<CommitteeItem> = z.object({
  name: z.string(),
  description: z.string().optional(),
  headName: z.string().optional(),
  memberCount: z.number().optional(),
  icon: z.string().optional(),
});

export const organizationProgramSchema: z.ZodType<OrganizationProgram> = z.object({
  name: z.string(),
  description: z.string().optional(),
  schedule: z.string().optional(),
  icon: z.string().optional(),
});

export const flagshipEventSchema: z.ZodType<FlagshipEvent> = z.object({
  name: z.string(),
  description: z.string().optional(),
  frequency: z.string().optional(),
  eventId: z.string().optional(),
});

export const projectItemSchema: z.ZodType<ProjectItem> = z.object({
  name: z.string(),
  role: z.string().optional(),
  description: z.string().optional(),
  date: z.string().optional(),
  url: z.string().optional(),
});

export const milestoneItemSchema: z.ZodType<MilestoneItem> = z.object({
  title: z.string(),
  date: z.string().optional(),
  description: z.string().optional(),
  category: z.string().optional(),
});

export const organizationAchievementSchema: z.ZodType<OrganizationAchievement> = z.object({
  title: z.string(),
  date: z.string().optional(),
  description: z.string().optional(),
  category: z.enum(['award', 'recognition', 'milestone', 'project']).optional(),
  imageUrl: z.string().optional(),
});

export const organizationMemberSchema: z.ZodType<OrganizationMember> = z.object({
  id: z.string(),
  name: z.string(),
  position: z.string(),
  photo: z.string(),
  bio: z.string(),
  joinedDate: z.string().optional(),
  achievements: z.array(z.string()).optional(),
  responsibilities: z.array(z.string()).optional(),
  skills: z.array(z.string()).optional(),
  timeline: z.array(z.object({
    year: z.string(),
    title: z.string(),
    description: z.string(),
    category: z.enum(['achievement', 'project', 'milestone', 'award', 'education']),
    details: z.array(z.string()).optional(),
  })).optional(),
  gallery: z.array(z.string()).optional(),
  social: z.object({
    linkedin: z.string().optional(),
    github: z.string().optional(),
    email: z.string().optional(),
  }).optional(),
  phone: z.string().optional(),
  personalEmail: z.string().optional(),
  program: z.string().optional(),
  yearLevel: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  memberType: z.enum(['officer', 'general', 'alumni', 'honorary', 'advisor']).optional(),
  status: z.enum(['active', 'inactive', 'alumni']).optional(),
  sortOrder: z.number().optional(),
  batch: z.string().optional(),
  termStart: z.string().optional(),
  termEnd: z.string().optional(),
  leadershipStatus: z.enum(['current', 'past', 'emeritus']).optional(),
  course: z.string().optional(),
  department: z.string().optional(),
  committee: z.string().optional(),
  displayOrder: z.number().optional(),
  isAdviser: z.boolean().optional(),
  contactNumber: z.string().optional(),
  projectItems: z.array(projectItemSchema).optional(),
  milestoneItems: z.array(milestoneItemSchema).optional(),
});

export const organizationSchema: z.ZodType<Organization> = z.object({
  _id: z.string(),
  id: z.string(),
  name: z.string(),
  fullName: z.string(),
  description: z.string(),
  longDescription: z.string(),
  logo: z.string(),
  banner: z.string(),
  established: z.string(),
  mission: z.string(),
  vision: z.string(),
  values: z.array(z.string()),
  achievements: z.array(z.string()),
  color: z.object({
    primary: z.string(),
    secondary: z.string(),
    accent: z.string(),
  }),
  email: z.string().optional(),
  phone: z.string().optional(),
  website: z.string().optional(),
  facebookUrl: z.string().optional(),
  twitterUrl: z.string().optional(),
  instagramUrl: z.string().optional(),
  tiktokUrl: z.string().optional(),
  linkedinUrl: z.string().optional(),
  building: z.string().optional(),
  room: z.string().optional(),
  campus: z.string().optional(),
  advisorName: z.string().optional(),
  advisorEmail: z.string().optional(),
  moderatorName: z.string().optional(),
  moderatorEmail: z.string().optional(),
  organizationType: z.union([organizationTypeSchema, z.string()]).optional(),
  tags: z.array(z.string()).optional(),
  gallery: z.array(mediaAssetSchema).optional(),
  seoDescription: z.string().optional(),
  isActive: z.boolean().optional(),
  tagline: z.string().optional(),
  officialEmail: z.string().optional(),
  socialLinks: z.array(socialLinkSchema).optional(),
  adviserItems: z.array(adviserItemSchema).optional(),
  officeLocation: officeLocationSchema.optional(),
  meetingSchedule: z.string().optional(),
  membershipSize: z.number().optional(),
  joinRequirements: z.string().optional(),
  joinSteps: z.array(z.string()).optional(),
  joinUrl: z.string().optional(),
  benefits: z.string().optional(),
  programs: z.array(organizationProgramSchema).optional(),
  flagshipEvents: z.array(flagshipEventSchema).optional(),
  partnerItems: z.array(partnerItemSchema).optional(),
  committeeItems: z.array(committeeItemSchema).optional(),
  structuredAchievements: z.array(organizationAchievementSchema).optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const membershipHistoryEntrySchema: z.ZodType<MembershipHistoryEntry> = z.object({
  field: z.string(),
  oldValue: z.string().optional(),
  newValue: z.string().optional(),
  changedBy: z.string().optional(),
  changedAt: z.string(),
});

export const membershipContributionSchema: z.ZodType<MembershipContribution> = z.object({
  type: z.string(),
  description: z.string(),
  hours: z.number().optional(),
  date: z.string(),
});

export const organizationMembershipSchema: z.ZodType<OrganizationMembership> = z.object({
  _id: z.string(),
  studentId: z.string(),
  organizationId: z.string(),
  position: z.string(),
  memberType: memberTypeSchema,
  status: membershipStatusSchema,
  appliedAt: z.string().optional(),
  invitedAt: z.string().optional(),
  approvedAt: z.string().optional(),
  rejectedAt: z.string().optional(),
  resignedAt: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  academicYear: z.string().optional(),
  semester: z.string().optional(),
  notes: z.string().optional(),
  history: z.array(membershipHistoryEntrySchema),
  contributions: z.array(membershipContributionSchema).optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
