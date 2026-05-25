import { body, param, query } from 'express-validator';

export const contentTypeValidator = [
  param('contentType')
    .isIn(['news', 'announcement', 'event'])
    .withMessage('contentType must be news, announcement, or event'),
];

export const contentIdValidator = [
  param('contentId')
    .isMongoId()
    .withMessage('contentId must be a valid MongoDB ObjectId'),
];

export const paginationValidator = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('page must be a positive integer')
    .toInt(),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('limit must be between 1 and 100')
    .toInt(),
  query('type')
    .optional()
    .isIn(['all', 'events', 'news', 'announcements'])
    .withMessage('type must be all, events, news, or announcements'),
];

export const contentApprovalCommentValidator = [
  body('comment')
    .optional()
    .isString()
    .withMessage('comment must be a string')
    .trim()
    .isLength({ max: 500 })
    .withMessage('comment cannot exceed 500 characters'),
];

export const contentRejectionValidator = [
  body('reason')
    .trim()
    .notEmpty()
    .withMessage('reason is required')
    .isLength({ max: 500 })
    .withMessage('reason cannot exceed 500 characters'),
  ...contentApprovalCommentValidator,
];
