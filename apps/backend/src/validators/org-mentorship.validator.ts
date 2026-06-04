import { body, param } from 'express-validator';

export const createMentorshipValidator = [
  body('menteeOrgId').trim().notEmpty().withMessage('Mentee organization ID is required'),
  body('focusAreas').isArray({ min: 1 }).withMessage('At least one focus area is required'),
  body('startDate').isISO8601().withMessage('Start date is required').toDate(),
  body('endDate').optional().isISO8601().toDate(),
  body('partnershipId').optional().isMongoId(),
];

export const mentorshipIdValidator = [param('id').isMongoId().withMessage('Invalid mentorship ID')];

export const mentorshipStatusValidator = [
  param('id').isMongoId().withMessage('Invalid mentorship ID'),
  body('status').isIn(['active', 'completed', 'cancelled']).withMessage('Invalid status'),
];
