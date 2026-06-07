import { body, param } from 'express-validator';

export const createResourceRequestValidator = [
  body('resourceType').trim().notEmpty().withMessage('Resource type is required'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('providingOrgId').optional().trim(),
  body('quantity').optional().isInt({ min: 1 }),
  body('dateNeeded').optional().isISO8601().toDate(),
  body('duration').optional().isInt({ min: 1 }),
  body('partnershipId').optional().isMongoId(),
  body('linkedEventIds').optional().isArray(),
  body('linkedEventIds.*').optional().isMongoId().withMessage('Invalid linked event ID'),
  body('linkedTaskIds').optional().isArray(),
  body('linkedTaskIds.*').optional().isMongoId().withMessage('Invalid linked task ID'),
  body('linkedMeetingIds').optional().isArray(),
  body('linkedMeetingIds.*').optional().isMongoId().withMessage('Invalid linked meeting ID'),
];

export const resourceIdValidator = [param('id').isMongoId().withMessage('Invalid request ID')];

export const reviewResourceValidator = [
  param('id').isMongoId().withMessage('Invalid request ID'),
  body('notes').optional().trim(),
];
