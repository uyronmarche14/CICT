import OrgVote from '../models/OrgVote';
import OrgVoteBallot from '../models/OrgVoteBallot';
import OrganizationMembership from '../models/OrganizationMembership';

export async function isStudentEligibleToVote(
  studentId: string,
  organizationId: string,
  voteId: string
): Promise<{ eligible: boolean; reason?: string }> {
  const membership = await OrganizationMembership.findOne({
    studentId: studentId,
    organizationId: organizationId,
    status: 'active',
  }).lean();

  if (!membership) {
    return { eligible: false, reason: 'Not an active member of this organization' };
  }

  const vote = await OrgVote.findById(voteId).lean();
  if (!vote) {
    return { eligible: false, reason: 'Vote not found' };
  }

  if (!vote.isActive) {
    return { eligible: false, reason: 'Vote is not active' };
  }

  const now = new Date();
  if (now < new Date(vote.startDate)) {
    return { eligible: false, reason: 'Voting has not started yet' };
  }

  if (now > new Date(vote.endDate)) {
    return { eligible: false, reason: 'Voting has ended' };
  }

  if (vote.eligibleMemberTypes && vote.eligibleMemberTypes.length > 0) {
    if (!vote.eligibleMemberTypes.includes(membership.memberType as any)) {
      return { eligible: false, reason: 'Your membership type is not eligible for this vote' };
    }
  }

  const existing = await OrgVoteBallot.findOne({ voteId: vote._id as any, voterId: studentId }).lean();
  if (existing) {
    return { eligible: false, reason: 'You have already voted' };
  }

  return { eligible: true };
}
