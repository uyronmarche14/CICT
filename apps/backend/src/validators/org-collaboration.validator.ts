import { body, param } from 'express-validator';

export const createSpaceValidator = [
  body('name').trim().notEmpty().withMessage('Space name is required'),
  body('description').optional().trim(),
  body('participantOrgIds').optional().isArray(),
  body('participantUserIds').optional().isArray(),
];

export const updateSpaceValidator = [
  param('id').isMongoId().withMessage('Invalid space ID'),
  body('name').optional().trim().notEmpty(),
  body('description').optional().trim(),
  body('participantOrgIds').optional().isArray(),
  body('participantUserIds').optional().isArray(),
  body('isActive').optional().isBoolean(),
];

export const spaceIdValidator = [param('id').isMongoId().withMessage('Invalid space ID')];

export const sendMessageValidator = [
  param('id').isMongoId().withMessage('Invalid space ID'),
  body('content').trim().notEmpty().withMessage('Message content is required'),
];

export const messageIdValidator = [
  param('id').isMongoId().withMessage('Invalid space ID'),
  param('msgId').isMongoId().withMessage('Invalid message ID'),
];
