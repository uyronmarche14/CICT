import { Request, Response } from 'express';
import { getUpdates } from '../services/updates.service';

const parsePositiveInt = (val: string | undefined, fallback: number): number => {
  if (!val) {return fallback;}
  const parsed = parseInt(val, 10);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
};

export const getUpdatesFeed = async (req: Request, res: Response): Promise<void> => {
  const {
    category = 'all',
    scope = 'all',
    org,
    q,
    page: pageStr,
    limit: limitStr,
  } = req.query as Record<string, string | undefined>;

  const page = parsePositiveInt(pageStr, 1);
  const limit = Math.min(parsePositiveInt(limitStr, 20), 50);

  const result = await getUpdates({
    category: (category as 'all' | 'news' | 'announcements' | 'events') || 'all',
    scope: (scope as 'all' | 'official' | 'community') || 'all',
    org,
    q,
    page,
    limit,
  });

  res.json({
    success: true,
    data: result,
  });
};
