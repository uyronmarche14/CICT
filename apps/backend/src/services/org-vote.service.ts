import Organization from '../models/Organization';
import OrgVote from '../models/OrgVote';
import OrgVoteBallot from '../models/OrgVoteBallot';
import { type AuthRequest } from '../middleware/auth';
import { type StudentAuthRequest } from '../middleware/studentAuth';
import { AppError } from '../middleware/errorHandler';
import { canAccessOrganizationScope } from '../utils/organizationScope';
import { Permission } from '../types';
import { isStudentEligibleToVote } from './vote-eligibility.service';
import { pickAllowedFields } from '../utils/allowedFields';

const VOTE_ALLOWED = ['title', 'description', 'positions', 'candidates', 'startDate', 'endDate', 'isAnonymous', 'eligibleMemberTypes', 'resultsVisibility', 'allowAdminBallots'];

const resolveOrg = async (req: AuthRequest, orgId: string) => {
  if (!req.user) {throw new AppError('User not authenticated', 401);}
  if (!canAccessOrganizationScope(req.user, orgId, Permission.MANAGE_ORG_VOTES)) {
    throw new AppError('You do not have access to manage votes for this organization', 403);
  }
  const organization = await Organization.findOne({ id: orgId }).select('_id');
  if (!organization) {throw new AppError('Organization not found', 404);}
  return organization._id;
};

export const listVotes = async (req: AuthRequest, orgId: string) => {
  const oid = await resolveOrg(req, orgId);
  return OrgVote.find({ organizationId: String(oid) }).sort({ startDate: -1 }).lean();
};

export const createVote = async (req: AuthRequest, orgId: string) => {
  const oid = await resolveOrg(req, orgId);
  const createdBy = req.user?.userId;
  if (!createdBy) {throw new AppError('User not authenticated', 401);}
  return OrgVote.create({ ...pickAllowedFields(req.body, VOTE_ALLOWED), organizationId: String(oid), createdBy });
};

export const getVote = async (req: AuthRequest, orgId: string, voteId: string) => {
  const oid = await resolveOrg(req, orgId);
  const vote = await OrgVote.findOne({ _id: voteId, organizationId: String(oid) }).lean();
  if (!vote) {throw new AppError('Vote not found', 404);}
  return vote;
};

export const updateVote = async (req: AuthRequest, orgId: string, voteId: string) => {
  const oid = await resolveOrg(req, orgId);
  const vote = await OrgVote.findOneAndUpdate(
    { _id: voteId, organizationId: String(oid) },
    { $set: pickAllowedFields(req.body, VOTE_ALLOWED) },
    { new: true, runValidators: true }
  );
  if (!vote) {throw new AppError('Vote not found', 404);}
  return vote;
};

export const deleteVote = async (req: AuthRequest, orgId: string, voteId: string) => {
  const oid = await resolveOrg(req, orgId);
  const vote = await OrgVote.findOneAndDelete({ _id: voteId, organizationId: String(oid) });
  if (!vote) {throw new AppError('Vote not found', 404);}
};

export const castBallot = async (req: AuthRequest, orgId: string, voteId: string) => {
  const oid = await resolveOrg(req, orgId);
  const vote = await OrgVote.findOne({ _id: voteId, organizationId: String(oid) });
  if (!vote) {throw new AppError('Vote not found', 404);}
  if (!vote.isActive) {throw new AppError('Voting is closed', 400);}

  const voterId = req.user?.userId;
  if (!voterId) {throw new AppError('User not authenticated', 401);}
  const existing = await OrgVoteBallot.findOne({ voteId, voterId });
  if (existing) {throw new AppError('You have already cast your ballot', 409);}

  return OrgVoteBallot.create({ voteId, voterId, voterType: 'admin', selections: req.body.selections });
};

export const studentCastBallot = async (req: StudentAuthRequest, orgId: string, voteId: string) => {
  const vote = await OrgVote.findById(voteId).lean();
  if (!vote) {throw new AppError('Vote not found', 404);}
  if (!vote.isActive) {throw new AppError('Voting is closed', 400);}

  const studentId = req.student!.studentId;
  const eligibility = await isStudentEligibleToVote(studentId, orgId, voteId);
  if (!eligibility.eligible) {throw new AppError(eligibility.reason || 'Not eligible to vote', 403);}

  const existing = await OrgVoteBallot.findOne({ voteId, voterId: studentId });
  if (existing) {throw new AppError('You have already cast your ballot', 409);}

  return OrgVoteBallot.create({
    voteId,
    voterId: studentId,
    voterType: 'student',
    selections: req.body.selections,
  });
};

export const getResults = async (req: AuthRequest, orgId: string, voteId: string) => {
  const oid = await resolveOrg(req, orgId);
  const vote = await OrgVote.findOne({ _id: voteId, organizationId: String(oid) }).lean();
  if (!vote) {throw new AppError('Vote not found', 404);}

  const ballots = await OrgVoteBallot.find({ voteId }).lean();
  const results: Record<string, Record<string, number>> = {};
  for (const position of vote.positions) {
    results[position.title] = {};
    for (const candidate of vote.candidates.filter((c) => c.position === position.title)) {
      results[position.title][candidate.name] = 0;
    }
  }
  for (const ballot of ballots) {
    for (const selection of ballot.selections) {
      if (!results[selection.position]) {continue;}
      for (const candidateId of selection.candidateIds) {
        const candidate = vote.candidates.find((c) => c.name === candidateId);
        if (candidate) {results[selection.position][candidate.name] = (results[selection.position][candidate.name] || 0) + 1;}
      }
    }
  }
  return { vote, results, totalBallots: ballots.length };
};

export const studentGetResults = async (_req: StudentAuthRequest, _orgId: string, voteId: string) => {
  const vote = await OrgVote.findById(voteId).lean();
  if (!vote) {throw new AppError('Vote not found', 404);}

  if (vote.resultsVisibility === 'admins_only') {
    throw new AppError('Results are not available to students', 403);
  }

  if (vote.resultsVisibility === 'members_after_close' && vote.isActive) {
    throw new AppError('Results will be available after voting ends', 403);
  }

  const ballots = await OrgVoteBallot.find({ voteId }).lean();
  const results: Record<string, Record<string, number>> = {};
  for (const position of vote.positions) {
    results[position.title] = {};
    for (const candidate of vote.candidates.filter((c) => c.position === position.title)) {
      results[position.title][candidate.name] = 0;
    }
  }
  for (const ballot of ballots) {
    for (const selection of ballot.selections) {
      if (!results[selection.position]) {continue;}
      for (const candidateId of selection.candidateIds) {
        const candidate = vote.candidates.find((c) => c.name === candidateId);
        if (candidate) {results[selection.position][candidate.name] = (results[selection.position][candidate.name] || 0) + 1;}
      }
    }
  }
  return { vote, results, totalBallots: ballots.length };
};
