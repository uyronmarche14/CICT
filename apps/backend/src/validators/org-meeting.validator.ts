import { body, param } from 'express-validator';

export const createMeetingValidator = [
  body('title').trim().notEmpty().withMessage('Meeting title is required'),
  body('description').optional().trim(),
  body('agenda').optional().isArray(),
  body('date').isISO8601().withMessage('Valid date is required').toDate(),
  body('duration').isInt({ min: 1 }).withMessage('Duration is required in minutes'),
  body('location').optional().trim(),
  body('meetingUrl').optional().trim(),
  body('attendees').optional().isArray(),
  body('minutes').optional().trim(),
  body('actionItems').optional().isArray(),
];

export const updateMeetingValidator = [
  param('meetingId').isMongoId().withMessage('Invalid meeting ID'),
  body('title').optional().trim().notEmpty(),
  body('description').optional().trim(),
  body('agenda').optional().isArray(),
  body('date').optional().isISO8601().toDate(),
  body('duration').optional().isInt({ min: 1 }),
  body('location').optional().trim(),
  body('meetingUrl').optional().trim(),
  body('attendees').optional().isArray(),
  body('minutes').optional().trim(),
  body('actionItems').optional().isArray(),
];

export const meetingIdValidator = [param('meetingId').isMongoId().withMessage('Invalid meeting ID')];

export const updateMinutesValidator = [
  param('meetingId').isMongoId().withMessage('Invalid meeting ID'),
  body('minutes').isString().withMessage('Minutes must be a string'),
];

export const updateActionItemsValidator = [
  param('meetingId').isMongoId().withMessage('Invalid meeting ID'),
  body('actionItems').isArray({ min: 1 }).withMessage('Action items array is required'),
];
