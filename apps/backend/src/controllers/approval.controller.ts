import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import {
  getPendingApprovals as getPendingApprovalsService,
  getApprovalStats as getApprovalStatsService,
  getApprovalHistory as getApprovalHistoryService,
} from '../services/approval.service';

export const getPendingApprovals = async (req: AuthRequest, res: Response) => {
  const result = await getPendingApprovalsService(req);
  res.json({ success: true, data: result });
};

export const getApprovalStats = async (req: AuthRequest, res: Response) => {
  const data = await getApprovalStatsService(req);
  res.json({ success: true, data });
};

export const getApprovalHistory = async (req: AuthRequest, res: Response) => {
  const { contentType, contentId } = req.params;
  const actions = await getApprovalHistoryService(contentType, contentId);
  res.json({ success: true, data: { actions } });
};
