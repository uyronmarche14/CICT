import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import {
  getFAQContent as getFAQContentService,
  upsertFAQContent as upsertFAQContentService,
} from '../services/faq.service';

export const getFAQContent = async (_req: AuthRequest, res: Response): Promise<void> => {
  const data = await getFAQContentService();

  res.status(200).json({
    success: true,
    data,
  });
};

export const upsertFAQContent = async (req: AuthRequest, res: Response): Promise<void> => {
  const faqContent = await upsertFAQContentService(req.body);

  res.status(200).json({
    success: true,
    message: 'FAQ content updated successfully',
    data: faqContent,
  });
};
