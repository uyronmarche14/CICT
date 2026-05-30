import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import * as service from '../services/org-partnership.service';

export const listPartnerships = async (req: AuthRequest, res: Response) => {
  const data = await service.listPartnerships(req, req.params.orgId);
  res.json({ success: true, data });
};
export const createPartnership = async (req: AuthRequest, res: Response) => {
  const data = await service.createPartnership(req, req.params.orgId);
  res.status(201).json({ success: true, data });
};
export const getPartnership = async (req: AuthRequest, res: Response) => {
  const data = await service.getPartnership(req, req.params.orgId, req.params.id);
  res.json({ success: true, data });
};
export const acceptPartnership = async (req: AuthRequest, res: Response) => {
  const data = await service.acceptPartnership(req, req.params.orgId, req.params.id);
  res.json({ success: true, data });
};
export const declinePartnership = async (req: AuthRequest, res: Response) => {
  const data = await service.declinePartnership(req, req.params.orgId, req.params.id);
  res.json({ success: true, data });
};
export const terminatePartnership = async (req: AuthRequest, res: Response) => {
  const data = await service.terminatePartnership(req, req.params.orgId, req.params.id);
  res.json({ success: true, data });
};
