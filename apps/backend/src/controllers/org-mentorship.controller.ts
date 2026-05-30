import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import * as ms from '../services/org-mentorship.service';

export const listMentorships = async (req: AuthRequest, res: Response) => {
  const data = await ms.listMentorships(req, req.params.orgId);
  res.json({ success: true, data });
};
export const createMentorship = async (req: AuthRequest, res: Response) => {
  const data = await ms.createMentorship(req, req.params.orgId);
  res.status(201).json({ success: true, data });
};
export const getMentorship = async (req: AuthRequest, res: Response) => {
  const data = await ms.getMentorship(req, req.params.orgId, req.params.id);
  res.json({ success: true, data });
};
export const updateMentorshipStatus = async (req: AuthRequest, res: Response) => {
  const data = await ms.updateMentorshipStatus(req, req.params.orgId, req.params.id);
  res.json({ success: true, data });
};
export const deleteMentorship = async (req: AuthRequest, res: Response) => {
  await ms.deleteMentorship(req, req.params.orgId, req.params.id);
  res.json({ success: true, message: 'Mentorship deleted' });
};
