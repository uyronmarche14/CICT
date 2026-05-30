import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import * as analyticsService from '../services/org-analytics.service';

export const getOverview = async (req: AuthRequest, res: Response) => {
  const data = await analyticsService.getOverview(req, req.params.orgId);
  res.json({ success: true, data });
};

export const getTaskAnalytics = async (req: AuthRequest, res: Response) => {
  const data = await analyticsService.getTaskAnalytics(req, req.params.orgId);
  res.json({ success: true, data });
};

export const getEventAnalytics = async (req: AuthRequest, res: Response) => {
  const data = await analyticsService.getEventAnalytics(req, req.params.orgId);
  res.json({ success: true, data });
};

export const getFinancialAnalytics = async (req: AuthRequest, res: Response) => {
  const data = await analyticsService.getFinancialAnalytics(req, req.params.orgId);
  res.json({ success: true, data });
};

export const getEngagement = async (req: AuthRequest, res: Response) => {
  const data = await analyticsService.getEngagement(req, req.params.orgId);
  res.json({ success: true, data });
};

export const exportReport = async (req: AuthRequest, res: Response) => {
  const data = await analyticsService.exportReport(req, req.params.orgId);
  res.json({ success: true, data });
};
