import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { StudentAuthRequest } from '../middleware/studentAuth';
import OrgVote from '../models/OrgVote';
import {
  listVotes as listVotesService,
  createVote as createVoteService,
  getVote as getVoteService,
  updateVote as updateVoteService,
  deleteVote as deleteVoteService,
  castBallot as castBallotService,
  getResults as getResultsService,
  studentCastBallot as studentCastBallotService,
  studentGetResults as studentGetResultsService,
} from '../services/org-vote.service';

export const listVotes = async (req: AuthRequest, res: Response) => {
  const data = await listVotesService(req, req.params.orgId);
  res.json({ success: true, data });
};

export const createVote = async (req: AuthRequest, res: Response) => {
  const data = await createVoteService(req, req.params.orgId);
  res.status(201).json({ success: true, data });
};

export const getVote = async (req: AuthRequest, res: Response) => {
  const data = await getVoteService(req, req.params.orgId, req.params.voteId);
  res.json({ success: true, data });
};

export const updateVote = async (req: AuthRequest, res: Response) => {
  const data = await updateVoteService(req, req.params.orgId, req.params.voteId);
  res.json({ success: true, data });
};

export const deleteVote = async (req: AuthRequest, res: Response) => {
  await deleteVoteService(req, req.params.orgId, req.params.voteId);
  res.json({ success: true, message: 'Vote deleted' });
};

export const castBallot = async (req: AuthRequest, res: Response) => {
  const data = await castBallotService(req, req.params.orgId, req.params.voteId);
  res.status(201).json({ success: true, data });
};

export const getResults = async (req: AuthRequest, res: Response) => {
  const data = await getResultsService(req, req.params.orgId, req.params.voteId);
  res.json({ success: true, data });
};

export const studentListVotes = async (req: StudentAuthRequest, res: Response) => {
  const data = await OrgVote.find({
    organizationId: req.params.orgId,
    isActive: true,
  }).sort({ startDate: -1 }).lean();
  res.json({ success: true, data });
};

export const studentGetVote = async (req: StudentAuthRequest, res: Response) => {
  const vote = await OrgVote.findOne({
    _id: req.params.voteId,
    organizationId: req.params.orgId,
  }).lean();
  if (!vote) {res.status(404).json({ success: false, message: 'Vote not found' }); return;}
  res.json({ success: true, data: vote });
};

export const studentCastBallot = async (req: StudentAuthRequest, res: Response) => {
  const data = await studentCastBallotService(req, req.params.orgId, req.params.voteId);
  res.status(201).json({ success: true, data });
};

export const studentGetResults = async (req: StudentAuthRequest, res: Response) => {
  const data = await studentGetResultsService(req, req.params.orgId, req.params.voteId);
  res.json({ success: true, data });
};
