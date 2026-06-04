import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import {
  getContentLookup,
  getOrganizationLookup,
  getReferenceDataLookup,
  getStudentLookup,
  getUserLookup,
} from '../services/lookup.service';

export const getOrganizations = async (req: AuthRequest, res: Response): Promise<void> => {
  const data = await getOrganizationLookup(req.query);
  res.status(200).json({ success: true, data });
};

export const getUsers = async (req: AuthRequest, res: Response): Promise<void> => {
  const data = await getUserLookup(req.query);
  res.status(200).json({ success: true, data });
};

export const getStudents = async (req: AuthRequest, res: Response): Promise<void> => {
  const data = await getStudentLookup(req.query);
  res.status(200).json({ success: true, data });
};

export const getContent = async (req: AuthRequest, res: Response): Promise<void> => {
  const data = await getContentLookup(req.query);
  res.status(200).json({ success: true, data });
};

export const getReferenceData = async (_req: AuthRequest, res: Response): Promise<void> => {
  const data = await getReferenceDataLookup();
  res.status(200).json({ success: true, data });
};
