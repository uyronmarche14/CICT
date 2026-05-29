import { body, param } from 'express-validator';

export const createTemplateValidator = [
  body('name').trim().notEmpty().withMessage('Template name is required'),
  body('description').optional().trim(),
  body('defaultRoles').optional().isArray(),
  body('defaultColorScheme').optional().isObject(),
  body('defaultStructure').optional().isObject(),
];

export const updateTemplateValidator = [
  param('templateId').isMongoId().withMessage('Invalid template ID'),
  body('name').optional().trim().notEmpty(),
  body('description').optional().trim(),
  body('defaultRoles').optional().isArray(),
  body('defaultColorScheme').optional().isObject(),
  body('defaultStructure').optional().isObject(),
];

export const templateIdValidator = [
  param('templateId').isMongoId().withMessage('Invalid template ID'),
];

export const applyTemplateValidator = [
  param('templateId').isMongoId().withMessage('Invalid template ID'),
  body('organizationId').isMongoId().withMessage('Valid organization ID is required'),
];
