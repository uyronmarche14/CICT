import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import {
  listVotes as listVotesService,
  createVote as createVoteService,
  getVote as getVoteService,
  updateVote as updateVoteService,
  deleteVote as deleteVoteService,
  castBallot as castBallotService,
  getResults as getResultsService,
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
