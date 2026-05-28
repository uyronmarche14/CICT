import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import logger from '../utils/logger';
import {
  createNews as createNewsService,
  getAllNews as getAllNewsService,
  getNewsById as getNewsByIdService,
  updateNews as updateNewsService,
  deleteNews as deleteNewsService,
  submitNewsForApproval as submitNewsForApprovalService,
  approveNews as approveNewsService,
  rejectNews as rejectNewsService,
  publishNews as publishNewsService,
  archiveNews as archiveNewsService,
} from '../services/news.service';

export const createNews = async (req: AuthRequest, res: Response): Promise<void> => {
  if (!req.user) {
    throw new AppError('User not authenticated', 401);
  }

  const news = await createNewsService(req);

  res.status(201).json({
    success: true,
    message: 'News article created successfully',
    data: { news },
  });
};

export const getAllNews = async (req: AuthRequest, res: Response): Promise<void> => {
  const result = await getAllNewsService(req);

  res.status(200).json({
    success: true,
    data: result,
  });
};

export const getNewsById = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const news = await getNewsByIdService(id, req);

  res.status(200).json({
    success: true,
    data: { news },
  });
};

export const updateNews = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const news = await updateNewsService(id, req);

  res.status(200).json({
    success: true,
    message: 'News article updated successfully',
    data: { news },
  });
};

export const submitNewsForApproval = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const updated = await submitNewsForApprovalService(id, req);

  res.status(200).json({
    success: true,
    message: 'News article submitted for approval',
    data: { news: updated },
  });
};

export const approveNews = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const updated = await approveNewsService(id, req);

  res.status(200).json({
    success: true,
    message: 'News article approved successfully',
    data: { news: updated },
  });
};

export const rejectNews = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const updated = await rejectNewsService(id, req);

  res.status(200).json({
    success: true,
    message: 'News article rejected successfully',
    data: { news: updated },
  });
};

export const deleteNews = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  await deleteNewsService(id, req);

  res.status(200).json({
    success: true,
    message: 'News article deleted successfully',
  });
};

export const publishNews = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const updated = await publishNewsService(id, req);

  logger.info(`News published: ${id} by user ${req.user?.userId}`);

  res.status(200).json({
    success: true,
    message: 'News article published successfully',
    data: { news: updated },
  });
};

export const archiveNews = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const updated = await archiveNewsService(id, req);

  logger.info(`News archived: ${id} by user ${req.user?.userId}`);

  res.status(200).json({
    success: true,
    message: 'News article archived successfully',
    data: { news: updated },
  });
};
