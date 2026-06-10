import OrganizationAssignment from '../models/OrganizationAssignment';
import OrganizationMembership from '../models/OrganizationMembership';

type ProcessParticipantType =
  | 'user'
  | 'role'
  | 'organization'
  | 'organization_admin'
  | 'committee'
  | 'officer_position'
  | 'student_member'
  | 'student_applicant';

export async function resolveParticipants(
  assigneeType: ProcessParticipantType,
  assigneeId: string,
  organizationId?: string | null
): Promise<string[]> {
  switch (assigneeType) {
    case 'user':
      return [assigneeId];

    case 'organization': {
      const memberships = await OrganizationMembership.find({
        organizationId,
        status: 'active',
      }).select('studentId').lean();
      return memberships.map((m) => String(m.studentId));
    }

    case 'organization_admin': {
      const assignments = await OrganizationAssignment.find({
        organizationId,
      }).populate('user', '_id').lean();
      return assignments
        .map((a: any) => a.user?._id?.toString())
        .filter(Boolean);
    }

    case 'committee':
      return [];

    case 'officer_position': {
      const members = await OrganizationMembership.find({
        organizationId,
        position: assigneeId,
        status: 'active',
      }).select('studentId').lean();
      return members.map((m) => String(m.studentId));
    }

    case 'student_member': {
      const memberships = await OrganizationMembership.find({
        organizationId,
        status: 'active',
      }).select('studentId').lean();
      return memberships.map((m) => String(m.studentId));
    }

    case 'student_applicant': {
      const applicants = await OrganizationMembership.find({
        organizationId,
        status: 'applied',
      }).select('studentId').lean();
      return applicants.map((m) => String(m.studentId));
    }

    default:
      return [];
  }
}
