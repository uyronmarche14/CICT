import { body, param } from 'express-validator';

export const createResourceRequestValidator = [
  body('resourceType').isIn(['venue', 'equipment', 'budget', 'personnel', 'other']).withMessage('Invalid resource type'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('providingOrgId').optional().trim(),
  body('quantity').optional().isInt({ min: 1 }),
  body('dateNeeded').optional().isISO8601().toDate(),
  body('duration').optional().isInt({ min: 1 }),
];

export const resourceIdValidator = [param('id').isMongoId().withMessage('Invalid request ID')];

export const reviewResourceValidator = [
  param('id').isMongoId().withMessage('Invalid request ID'),
  body('notes').optional().trim(),
];
