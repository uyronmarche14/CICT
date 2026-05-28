import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import { getDashboardSummary as getDashboardSummaryService } from '../services/dashboard.service';

export const getDashboardSummary = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  if (!req.user) {
    throw new AppError('User not authenticated', 401);
  }

  const summary = await getDashboardSummaryService(req.user);

  res.status(200).json({
    success: true,
    data: summary,
  });
};
