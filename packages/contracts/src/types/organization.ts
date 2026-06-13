import type { OrganizationType } from '../enums/organization';
import type { MembershipStatus } from '../enums/organization';
import type { MemberType } from '../enums/organization';
import type { MediaAsset } from './common';

export type OfficeLocation = {
  building?: string;
  room?: string;
  campus?: string;
  mapUrl?: string;
};

export type SocialLink = {
  platform: string;
  url: string;
  label?: string;
};

export type AdviserItem = {
  name: string;
  role?: string;
  email?: string;
  photo?: string;
};

export type PartnerItem = {
  name: string;
  logo?: string;
  website?: string;
  description?: string;
  partnershipType?: string;
};

export type CommitteeItem = {
  name: string;
  description?: string;
  headName?: string;
  memberCount?: number;
  icon?: string;
};

export type OrganizationProgram = {
  name: string;
  description?: string;
  schedule?: string;
  icon?: string;
};

export type FlagshipEvent = {
  name: string;
  description?: string;
  frequency?: string;
  eventId?: string;
};

export type ProjectItem = {
  name: string;
  role?: string;
  description?: string;
  date?: string;
  url?: string;
};

export type MilestoneItem = {
  title: string;
  date?: string;
  description?: string;
  category?: string;
};

export type OrganizationAchievement = {
  title: string;
  date?: string;
  description?: string;
  category?: 'award' | 'recognition' | 'milestone' | 'project';
  imageUrl?: string;
};

export type Organization = {
  _id: string;
  id: string;
  name: string;
  fullName: string;
  description: string;
  longDescription: string;
  logo: string;
  banner: string;
  established: string;
  mission: string;
  vision: string;
  values: string[];
  achievements: string[];
  color: {
    primary: string;
    secondary: string;
    accent: string;
  };
  email?: string;
  phone?: string;
  website?: string;
  facebookUrl?: string;
  twitterUrl?: string;
  instagramUrl?: string;
  tiktokUrl?: string;
  linkedinUrl?: string;
  building?: string;
  room?: string;
  campus?: string;
  advisorName?: string;
  advisorEmail?: string;
  moderatorName?: string;
  moderatorEmail?: string;
  organizationType?: OrganizationType | string;
  tags?: string[];
  gallery?: MediaAsset[];
  seoDescription?: string;
  isActive?: boolean;
  tagline?: string;
  officialEmail?: string;
  socialLinks?: SocialLink[];
  adviserItems?: AdviserItem[];
  officeLocation?: OfficeLocation;
  meetingSchedule?: string;
  membershipSize?: number;
  joinRequirements?: string;
  joinSteps?: string[];
  joinUrl?: string;
  benefits?: string;
  programs?: OrganizationProgram[];
  flagshipEvents?: FlagshipEvent[];
  partnerItems?: PartnerItem[];
  committeeItems?: CommitteeItem[];
  structuredAchievements?: OrganizationAchievement[];
  createdAt: string;
  updatedAt: string;
};

export type OrganizationMember = {
  id: string;
  membershipId?: string;
  studentId?: string;
  isPublic?: boolean;
  name: string;
  position: string;
  photo: string;
  bio: string;
  joinedDate?: string;
  achievements?: string[];
  responsibilities?: string[];
  skills?: string[];
  timeline?: {
    year: string;
    title: string;
    description: string;
    category: 'achievement' | 'project' | 'milestone' | 'award' | 'education';
    details?: string[];
  }[];
  gallery?: string[];
  social?: {
    linkedin?: string;
    github?: string;
    email?: string;
  };
  phone?: string;
  personalEmail?: string;
  program?: string;
  yearLevel?: string;
  startDate?: string;
  endDate?: string;
  memberType?: 'officer' | 'general' | 'alumni' | 'honorary' | 'advisor';
  status?: 'active' | 'inactive' | 'alumni';
  sortOrder?: number;
  batch?: string;
  termStart?: string;
  termEnd?: string;
  leadershipStatus?: 'current' | 'past' | 'emeritus';
  course?: string;
  department?: string;
  committee?: string;
  displayOrder?: number;
  isAdviser?: boolean;
  contactNumber?: string;
  projectItems?: ProjectItem[];
  milestoneItems?: MilestoneItem[];
};

export type OrganizationMembership = {
  _id: string;
  studentId: string;
  organizationId: string;
  position: string;
  memberType: MemberType;
  status: MembershipStatus;
  appliedAt?: string;
  invitedAt?: string;
  approvedAt?: string;
  rejectedAt?: string;
  resignedAt?: string;
  startDate?: string;
  endDate?: string;
  academicYear?: string;
  semester?: string;
  notes?: string;
  history: MembershipHistoryEntry[];
  contributions?: MembershipContribution[];
  createdAt: string;
  updatedAt: string;
};

export type MembershipHistoryEntry = {
  field: string;
  oldValue?: string;
  newValue?: string;
  changedBy?: string;
  changedAt: string;
};

export type MembershipContribution = {
  type: string;
  description: string;
  hours?: number;
  date: string;
};
