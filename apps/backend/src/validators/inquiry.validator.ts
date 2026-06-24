import { body, param, query } from 'express-validator';

export const createInquiryValidator = [
  body('fullName')
    .trim()
    .notEmpty()
    .withMessage('Full name is required')
    .isLength({ max: 120 })
    .withMessage('Full name cannot exceed 120 characters'),

  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please enter a valid email address')
    .normalizeEmail(),

  body('contactNumber')
    .optional({ checkFalsy: true })
    .trim()
    .matches(/^[\d\s\-+()]{7,30}$/)
    .withMessage('Please enter a valid contact number'),

  body('userType')
    .trim()
    .notEmpty()
    .withMessage('User type is required')
    .isLength({ max: 80 })
    .withMessage('User type cannot exceed 80 characters'),

  body('subject')
    .trim()
    .notEmpty()
    .withMessage('Subject is required')
    .isLength({ max: 180 })
    .withMessage('Subject cannot exceed 180 characters'),

  body('inquiryType')
    .trim()
    .notEmpty()
    .withMessage('Inquiry type is required')
    .isLength({ max: 100 })
    .withMessage('Inquiry type cannot exceed 100 characters'),

  body('message')
    .trim()
    .isLength({ min: 10, max: 3000 })
    .withMessage('Message must be between 10 and 3000 characters'),
];

export const inquiryIdValidator = [
  param('id').isMongoId().withMessage('Invalid inquiry id'),
];

export const inquiryListValidator = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive number'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('status').optional().isIn(['new', 'read', 'archived']).withMessage('Invalid status'),
  query('search').optional().trim().isLength({ max: 120 }).withMessage('Search cannot exceed 120 characters'),
];

export const updateInquiryStatusValidator = [
  ...inquiryIdValidator,
  body('status').isIn(['new', 'read', 'archived']).withMessage('Invalid status'),
];
