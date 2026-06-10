import OrgTemplate from '../models/OrgTemplate';
import Organization from '../models/Organization';
import { type AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import { pickAllowedFields } from '../utils/allowedFields';

const TEMPLATE_ALLOWED = ['name', 'description', 'templateType', 'config', 'color', 'icon'];

export const listTemplates = async (req: AuthRequest) => {
  if (!req.user) {throw new AppError('User not authenticated', 401);}
  return OrgTemplate.find({ isActive: true }).sort({ name: 1 }).lean();
};

export const createTemplate = async (req: AuthRequest) => {
  if (!req.user) {throw new AppError('User not authenticated', 401);}
  return OrgTemplate.create({ ...pickAllowedFields(req.body, TEMPLATE_ALLOWED), createdBy: req.user.userId });
};

export const getTemplate = async (req: AuthRequest, templateId: string) => {
  if (!req.user) {throw new AppError('User not authenticated', 401);}
  const template = await OrgTemplate.findById(templateId).lean();
  if (!template) {throw new AppError('Template not found', 404);}
  return template;
};

export const updateTemplate = async (req: AuthRequest, templateId: string) => {
  if (!req.user) {throw new AppError('User not authenticated', 401);}
  const template = await OrgTemplate.findByIdAndUpdate(templateId, { $set: pickAllowedFields(req.body, TEMPLATE_ALLOWED) }, { new: true, runValidators: true });
  if (!template) {throw new AppError('Template not found', 404);}
  return template;
};

export const deleteTemplate = async (req: AuthRequest, templateId: string) => {
  if (!req.user) {throw new AppError('User not authenticated', 401);}
  const template = await OrgTemplate.findByIdAndDelete(templateId);
  if (!template) {throw new AppError('Template not found', 404);}
};

export const applyTemplate = async (req: AuthRequest, templateId: string) => {
  if (!req.user) {throw new AppError('User not authenticated', 401);}
  const template = await OrgTemplate.findById(templateId);
  if (!template) {throw new AppError('Template not found', 404);}

  const { organizationId } = req.body;
  const org = await Organization.findById(organizationId);
  if (!org) {throw new AppError('Organization not found', 404);}

  const updates: Record<string, unknown> = {};

  if (template.defaultColorScheme) {
    updates.color = {
      primary: template.defaultColorScheme.primary,
      secondary: template.defaultColorScheme.secondary,
      accent: template.defaultColorScheme.accent,
    };
  }

  if (template.defaultStructure) {
    if (template.defaultStructure.committees?.length) {
      updates.committeeItems = template.defaultStructure.committees.map((name) => ({ name }));
    }
    if (template.defaultStructure.programs?.length) {
      updates.programs = template.defaultStructure.programs.map((name) => ({ name }));
    }
  }

  if (Object.keys(updates).length > 0) {
    await Organization.findByIdAndUpdate(organizationId, { $set: updates });
  }

  return { applied: true, templateName: template.name };
};
