import { body, param } from 'express-validator';

export const createTaskForceValidator = [
  body('name').trim().notEmpty().withMessage('Task force name is required'),
  body('description').optional().trim(),
  body('participantOrgIds').optional().isArray(),
  body('objectives').optional().isArray(),
  body('startDate').isISO8601().withMessage('Start date is required').toDate(),
  body('endDate').optional().isISO8601().toDate(),
  body('partnershipId').optional().isMongoId(),
  body('linkedEventIds').optional().isArray(),
  body('linkedTaskIds').optional().isArray(),
  body('linkedMeetingIds').optional().isArray(),
];

export const updateTaskForceValidator = [
  param('id').isMongoId().withMessage('Invalid task force ID'),
  body('name').optional().trim().notEmpty(),
  body('description').optional().trim(),
  body('participantOrgIds').optional().isArray(),
  body('objectives').optional().isArray(),
  body('startDate').optional().isISO8601().toDate(),
  body('endDate').optional({ values: 'null' }).isISO8601().toDate(),
  body('partnershipId').optional().isMongoId(),
  body('linkedEventIds').optional().isArray(),
  body('linkedTaskIds').optional().isArray(),
  body('linkedMeetingIds').optional().isArray(),
];

export const taskForceIdValidator = [param('id').isMongoId().withMessage('Invalid task force ID')];

export const updateStatusValidator = [
  param('id').isMongoId().withMessage('Invalid task force ID'),
  body('status').isIn(['planning', 'active', 'completed', 'cancelled']).withMessage('Invalid status'),
];
