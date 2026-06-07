import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import {
  getReferenceDataLookup,
  getLookup,
} from '../services/lookup.service';

export const getLookupByKind = async (req: AuthRequest, res: Response): Promise<void> => {
  const data = await getLookup(req, req.params.kind);
  res.status(200).json({ success: true, data });
};

export const getReferenceData = async (_req: AuthRequest, res: Response): Promise<void> => {
  const data = await getReferenceDataLookup();
  res.status(200).json({ success: true, data });
};
