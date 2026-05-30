import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import * as cs from '../services/org-collaboration.service';

export const listSpaces = async (req: AuthRequest, res: Response) => {
  const data = await cs.listSpaces(req, req.params.orgId);
  res.json({ success: true, data });
};
export const createSpace = async (req: AuthRequest, res: Response) => {
  const data = await cs.createSpace(req, req.params.orgId);
  res.status(201).json({ success: true, data });
};
export const getSpace = async (req: AuthRequest, res: Response) => {
  const data = await cs.getSpace(req, req.params.orgId, req.params.id);
  res.json({ success: true, data });
};
export const updateSpace = async (req: AuthRequest, res: Response) => {
  const data = await cs.updateSpace(req, req.params.orgId, req.params.id);
  res.json({ success: true, data });
};
export const deleteSpace = async (req: AuthRequest, res: Response) => {
  await cs.deleteSpace(req, req.params.orgId, req.params.id);
  res.json({ success: true, message: 'Space deleted' });
};
export const listMessages = async (req: AuthRequest, res: Response) => {
  const data = await cs.listMessages(req, req.params.orgId, req.params.id);
  res.json({ success: true, data });
};
export const sendMessage = async (req: AuthRequest, res: Response) => {
  const data = await cs.sendMessage(req, req.params.orgId, req.params.id);
  res.status(201).json({ success: true, data });
};
export const deleteMessage = async (req: AuthRequest, res: Response) => {
  await cs.deleteMessage(req, req.params.orgId, req.params.id, req.params.msgId);
  res.json({ success: true, message: 'Message deleted' });
};
