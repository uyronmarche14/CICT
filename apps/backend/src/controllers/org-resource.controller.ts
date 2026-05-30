import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import * as rs from '../services/org-resource.service';

export const listOutgoing = async (req: AuthRequest, res: Response) => {
  const data = await rs.listOutgoing(req, req.params.orgId);
  res.json({ success: true, data });
};
export const listIncoming = async (req: AuthRequest, res: Response) => {
  const data = await rs.listIncoming(req, req.params.orgId);
  res.json({ success: true, data });
};
export const createRequest = async (req: AuthRequest, res: Response) => {
  const data = await rs.createRequest(req, req.params.orgId);
  res.status(201).json({ success: true, data });
};
export const getRequest = async (req: AuthRequest, res: Response) => {
  const data = await rs.getRequest(req, req.params.orgId, req.params.id);
  res.json({ success: true, data });
};
export const approveRequest = async (req: AuthRequest, res: Response) => {
  const data = await rs.approveRequest(req, req.params.orgId, req.params.id);
  res.json({ success: true, data });
};
export const denyRequest = async (req: AuthRequest, res: Response) => {
  const data = await rs.denyRequest(req, req.params.orgId, req.params.id);
  res.json({ success: true, data });
};
export const cancelRequest = async (req: AuthRequest, res: Response) => {
  const data = await rs.cancelRequest(req, req.params.orgId, req.params.id);
  res.json({ success: true, data });
};
