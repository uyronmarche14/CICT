import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import {
  listTemplates as listTemplatesService,
  createTemplate as createTemplateService,
  getTemplate as getTemplateService,
  updateTemplate as updateTemplateService,
  deleteTemplate as deleteTemplateService,
  applyTemplate as applyTemplateService,
} from '../services/org-template.service';

export const listTemplates = async (req: AuthRequest, res: Response) => {
  const data = await listTemplatesService(req);
  res.json({ success: true, data });
};

export const createTemplate = async (req: AuthRequest, res: Response) => {
  const data = await createTemplateService(req);
  res.status(201).json({ success: true, data });
};

export const getTemplate = async (req: AuthRequest, res: Response) => {
  const data = await getTemplateService(req, req.params.templateId);
  res.json({ success: true, data });
};

export const updateTemplate = async (req: AuthRequest, res: Response) => {
  const data = await updateTemplateService(req, req.params.templateId);
  res.json({ success: true, data });
};

export const deleteTemplate = async (req: AuthRequest, res: Response) => {
  await deleteTemplateService(req, req.params.templateId);
  res.json({ success: true, message: 'Template deleted' });
};

export const applyTemplate = async (req: AuthRequest, res: Response) => {
  const data = await applyTemplateService(req, req.params.templateId);
  res.json({ success: true, data });
};
