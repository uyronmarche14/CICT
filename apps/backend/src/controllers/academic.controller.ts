import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import {
  getPrograms as getProgramsService,
  createProgram as createProgramService,
  updateProgram as updateProgramService,
  getYearLevels as getYearLevelsService,
  createYearLevel as createYearLevelService,
  updateYearLevel as updateYearLevelService,
  getSections as getSectionsService,
  createSection as createSectionService,
  updateSection as updateSectionService,
} from '../services/academic.service';

export const getPrograms = async (_req: AuthRequest, res: Response): Promise<void> => {
  const programs = await getProgramsService();
  res.status(200).json({ success: true, data: { programs } });
};

export const createProgram = async (req: AuthRequest, res: Response): Promise<void> => {
  const program = await createProgramService(req.body);
  res.status(201).json({ success: true, data: { program } });
};

export const updateProgram = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const program = await updateProgramService(id, req.body);
  res.status(200).json({ success: true, data: { program } });
};

export const getYearLevels = async (_req: AuthRequest, res: Response): Promise<void> => {
  const yearLevels = await getYearLevelsService();
  res.status(200).json({ success: true, data: { yearLevels } });
};

export const createYearLevel = async (req: AuthRequest, res: Response): Promise<void> => {
  const yearLevel = await createYearLevelService(req.body);
  res.status(201).json({ success: true, data: { yearLevel } });
};

export const updateYearLevel = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const yearLevel = await updateYearLevelService(id, req.body);
  res.status(200).json({ success: true, data: { yearLevel } });
};

export const getSections = async (_req: AuthRequest, res: Response): Promise<void> => {
  const sections = await getSectionsService();
  res.status(200).json({ success: true, data: { sections } });
};

export const createSection = async (req: AuthRequest, res: Response): Promise<void> => {
  const section = await createSectionService(req.body);
  res.status(201).json({ success: true, data: { section } });
};

export const updateSection = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const section = await updateSectionService(id, req.body);
  res.status(200).json({ success: true, data: { section } });
};
