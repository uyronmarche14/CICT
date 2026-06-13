import crypto from 'crypto';
import { Types } from 'mongoose';
import OrganizationMember from '../models/OrganizationMember';
import OrganizationMembership from '../models/OrganizationMembership';
import Student from '../models/Student';

type MembershipLike = {
  _id: unknown;
  studentId: unknown;
  organizationId: string;
  position?: string;
  memberType?: string;
  status?: string;
  startDate?: Date | string;
  endDate?: Date | string;
};

const PUBLIC_PROFILE_MEMBER_TYPES = new Set(['officer', 'advisor']);

const toObjectId = (value: unknown): Types.ObjectId | null => {
  if (value instanceof Types.ObjectId) {
    return value;
  }
  if (typeof value === 'string' && Types.ObjectId.isValid(value)) {
    return new Types.ObjectId(value);
  }
  if (value && typeof value === 'object' && '_id' in value) {
    return toObjectId((value as { _id: unknown })._id);
  }
  return null;
};

const toDateString = (value: Date | string | undefined): string | undefined => {
  if (!value) {
    return undefined;
  }
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString();
};

const getStudentName = (student: { firstName?: string; lastName?: string } | null) =>
  [student?.firstName, student?.lastName].filter(Boolean).join(' ').trim() || 'Student Member';

export const syncPublicProfileForMembership = async (
  membership: MembershipLike
): Promise<void> => {
  const membershipId = toObjectId(membership._id);
  const studentId = toObjectId(membership.studentId);

  if (!membershipId || !studentId) {
    return;
  }

  const shouldHaveProfile =
    membership.status === 'active' && PUBLIC_PROFILE_MEMBER_TYPES.has(membership.memberType ?? '');

  const existingProfile = await OrganizationMember.findOne({
    $or: [
      { membershipId },
      { organizationId: membership.organizationId, studentId },
    ],
  });

  if (!shouldHaveProfile) {
    if (existingProfile?.membershipId) {
      existingProfile.status = membership.status === 'alumni' ? 'alumni' : 'inactive';
      existingProfile.isPublic = false;
      existingProfile.memberType = membership.memberType as typeof existingProfile.memberType;
      existingProfile.position = membership.position || existingProfile.position;
      existingProfile.endDate = toDateString(membership.endDate);
      existingProfile.termEnd = toDateString(membership.endDate);
      await existingProfile.save();
    }
    return;
  }

  const student = await Student.findById(studentId)
    .select('firstName lastName email profilePhoto phone')
    .lean();

  if (!student) {
    return;
  }

  const profileUpdates = {
    organizationId: membership.organizationId,
    membershipId,
    studentId,
    name: getStudentName(student),
    position: membership.position || 'Officer',
    photo: student.profilePhoto ?? existingProfile?.photo ?? '',
    memberType: membership.memberType as 'officer' | 'advisor',
    status: 'active' as const,
    startDate: toDateString(membership.startDate),
    endDate: toDateString(membership.endDate),
    termStart: toDateString(membership.startDate),
    termEnd: toDateString(membership.endDate),
    leadershipStatus: 'current' as const,
    personalEmail: student.email ?? existingProfile?.personalEmail,
    phone: student.phone ?? existingProfile?.phone,
  };

  if (existingProfile) {
    Object.assign(existingProfile, profileUpdates);
    await existingProfile.save();
    return;
  }

  await OrganizationMember.create({
    ...profileUpdates,
    id: crypto.randomUUID(),
    bio: '',
    isPublic: false,
    achievements: [],
    responsibilities: [],
    skills: [],
    timeline: [],
    gallery: [],
    social: student.email ? { email: student.email } : {},
    sortOrder: 0,
    projectItems: [],
    milestoneItems: [],
  });
};

export const syncPublicProfileByMembershipId = async (membershipId: string): Promise<void> => {
  const membership = await OrganizationMembership.findById(membershipId);
  if (!membership) {
    return;
  }

  await syncPublicProfileForMembership(membership);
};

export const hidePublicProfileForMembership = async (membershipId: unknown): Promise<void> => {
  const id = toObjectId(membershipId);
  if (!id) {
    return;
  }

  await OrganizationMember.updateOne(
    { membershipId: id },
    { $set: { isPublic: false, status: 'inactive', leadershipStatus: 'past' } }
  );
};
