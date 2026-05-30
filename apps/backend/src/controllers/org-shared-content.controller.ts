import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import * as sc from '../services/org-shared-content.service';

export const shareContent = async (req: AuthRequest, res: Response) => {
  const data = await sc.shareContent(req, req.params.orgId);
  res.status(201).json({ success: true, data });
};
export const listIncoming = async (req: AuthRequest, res: Response) => {
  const data = await sc.listIncoming(req, req.params.orgId);
  res.json({ success: true, data });
};
export const listOutgoing = async (req: AuthRequest, res: Response) => {
  const data = await sc.listOutgoing(req, req.params.orgId);
  res.json({ success: true, data });
};
export const removeShare = async (req: AuthRequest, res: Response) => {
  const data = await sc.removeShare(req, req.params.orgId, req.params.id);
  res.json({ success: true, data });
};
