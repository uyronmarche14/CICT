import { body, param } from 'express-validator';

const organizationBaseValidator = [
  body('id')
    .optional()
    .trim()
    .matches(/^[a-z0-9-]+$/)
    .withMessage('Organization slug must contain only lowercase letters, numbers, and hyphens'),
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 80 })
    .withMessage('Organization short name must be between 2 and 80 characters'),
  body('fullName')
    .optional()
    .trim()
    .isLength({ min: 3, max: 160 })
    .withMessage('Organization full name must be between 3 and 160 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ min: 10, max: 500 })
    .withMessage('Description must be between 10 and 500 characters'),
  body('longDescription')
    .optional()
    .trim()
    .isLength({ min: 20, max: 5000 })
    .withMessage('Long description must be between 20 and 5000 characters'),
  body('logo')
    .optional()
    .isURL()
    .withMessage('Logo must be a valid URL'),
  body('banner')
    .optional()
    .isURL()
    .withMessage('Banner must be a valid URL'),
  body('established')
    .optional()
    .trim()
    .isLength({ min: 2, max: 20 })
    .withMessage('Established field must be between 2 and 20 characters'),
  body('mission')
    .optional()
    .trim()
    .isLength({ min: 10, max: 2000 })
    .withMessage('Mission must be between 10 and 2000 characters'),
  body('vision')
    .optional()
    .trim()
    .isLength({ min: 10, max: 2000 })
    .withMessage('Vision must be between 10 and 2000 characters'),
  body('values')
    .optional()
    .isArray()
    .withMessage('Values must be an array'),
  body('achievements')
    .optional()
    .isArray()
    .withMessage('Achievements must be an array'),
  body('color')
    .optional()
    .isObject()
    .withMessage('Color must be an object'),
  body('color.primary')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Primary color is required when color is provided'),
  body('color.secondary')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Secondary color is required when color is provided'),
  body('color.accent')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Accent color is required when color is provided'),
  body('email')
    .optional()
    .isEmail()
    .withMessage('Email must be valid'),
  body('phone')
    .optional()
    .trim(),
  body('website')
    .optional()
    .isURL()
    .withMessage('Website must be a valid URL'),
  body('facebookUrl')
    .optional()
    .isURL()
    .withMessage('Facebook URL must be valid'),
  body('twitterUrl')
    .optional()
    .isURL()
    .withMessage('Twitter URL must be valid'),
  body('instagramUrl')
    .optional()
    .isURL()
    .withMessage('Instagram URL must be valid'),
  body('tiktokUrl')
    .optional()
    .isURL()
    .withMessage('TikTok URL must be valid'),
  body('linkedinUrl')
    .optional()
    .isURL()
    .withMessage('LinkedIn URL must be valid'),
  body('building')
    .optional()
    .trim(),
  body('room')
    .optional()
    .trim(),
  body('campus')
    .optional()
    .trim(),
  body('advisorName')
    .optional()
    .trim(),
  body('advisorEmail')
    .optional()
    .isEmail()
    .withMessage('Advisor email must be valid'),
  body('moderatorName')
    .optional()
    .trim(),
  body('moderatorEmail')
    .optional()
    .isEmail()
    .withMessage('Moderator email must be valid'),
  body('organizationType')
    .optional()
    .trim(),
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
  body('tags.*')
    .optional()
    .isString()
    .trim(),
  body('seoDescription')
    .optional()
    .trim(),
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean'),
  body('tagline')
    .optional()
    .trim(),
  body('officialEmail')
    .optional()
    .isEmail()
    .withMessage('Official email must be valid'),
  body('meetingSchedule')
    .optional()
    .trim(),
  body('membershipSize')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Membership size must be a positive integer'),
  body('joinRequirements')
    .optional()
    .trim(),
  body('joinSteps')
    .optional()
    .isArray()
    .withMessage('Join steps must be an array'),
  body('joinUrl')
    .optional()
    .isURL()
    .withMessage('Join URL must be valid'),
  body('benefits')
    .optional()
    .trim(),
];

export const createOrganizationValidator = [
  body('id').exists().withMessage('Organization slug is required'),
  body('name').exists().withMessage('Organization short name is required'),
  body('fullName').exists().withMessage('Organization full name is required'),
  body('description').exists().withMessage('Description is required'),
  body('longDescription').exists().withMessage('Long description is required'),
  body('logo').exists().withMessage('Logo is required'),
  body('banner').exists().withMessage('Banner is required'),
  body('established').exists().withMessage('Established field is required'),
  body('mission').exists().withMessage('Mission is required'),
  body('vision').exists().withMessage('Vision is required'),
  body('color').exists().withMessage('Color theme is required'),
  ...organizationBaseValidator,
];

export const updateOrganizationValidator = [
  param('id').notEmpty().withMessage('Organization id is required'),
  ...organizationBaseValidator,
];

export const organizationIdValidator = [
  param('id').isMongoId().withMessage('Invalid organization ID'),
];

export const createMemberValidator = [
  param('id').notEmpty().withMessage('Organization ID is required'),
  body('membershipId').optional().isMongoId().withMessage('membershipId must be a valid ID'),
  body('studentId').optional().isMongoId().withMessage('studentId must be a valid ID'),
  body('name')
    .trim()
    .notEmpty().withMessage('Member name is required')
    .isLength({ max: 200 }).withMessage('Member name must be at most 200 characters'),
  body('role')
    .optional()
    .trim()
    .isIn(['adviser', 'president', 'vp', 'secretary', 'treasurer', 'auditor', 'pio', 'member'])
    .withMessage('Invalid member role'),
  body('email')
    .optional()
    .isEmail().withMessage('Invalid email'),
  body('phone')
    .optional()
    .trim(),
  body('position')
    .optional()
    .trim()
    .isLength({ max: 200 }).withMessage('Position must be at most 200 characters'),
  body('photoUrl')
    .optional()
    .isURL().withMessage('Photo URL must be valid'),
  body('photo')
    .optional()
    .isString().withMessage('Photo must be a string'),
  body('bio')
    .optional()
    .isString().withMessage('Bio must be a string'),
  body('isPublic')
    .optional()
    .isBoolean().withMessage('isPublic must be a boolean'),
  body('sortOrder')
    .optional()
    .isInt({ min: 0 }).withMessage('Sort order must be a non-negative integer'),
  body('startYear')
    .optional()
    .isInt({ min: 1900, max: 2100 }).withMessage('Invalid start year'),
  body('endYear')
    .optional()
    .isInt({ min: 1900, max: 2100 }).withMessage('Invalid end year'),
  body('timeline')
    .optional()
    .isArray().withMessage('Timeline must be an array'),
];

export const updateMemberValidator = [
  param('orgId').notEmpty().withMessage('Organization ID is required'),
  param('memberId').notEmpty().withMessage('Member ID is required'),
  body('membershipId').optional().isMongoId().withMessage('membershipId must be a valid ID'),
  body('studentId').optional().isMongoId().withMessage('studentId must be a valid ID'),
  body('name')
    .optional()
    .trim()
    .notEmpty().withMessage('Member name cannot be empty')
    .isLength({ max: 200 }).withMessage('Member name must be at most 200 characters'),
  body('role')
    .optional()
    .trim()
    .isIn(['adviser', 'president', 'vp', 'secretary', 'treasurer', 'auditor', 'pio', 'member'])
    .withMessage('Invalid member role'),
  body('email')
    .optional()
    .isEmail().withMessage('Invalid email'),
  body('phone')
    .optional()
    .trim(),
  body('position')
    .optional()
    .trim()
    .isLength({ max: 200 }).withMessage('Position must be at most 200 characters'),
  body('photoUrl')
    .optional()
    .isURL().withMessage('Photo URL must be valid'),
  body('photo')
    .optional()
    .isString().withMessage('Photo must be a string'),
  body('bio')
    .optional()
    .isString().withMessage('Bio must be a string'),
  body('isPublic')
    .optional()
    .isBoolean().withMessage('isPublic must be a boolean'),
  body('sortOrder')
    .optional()
    .isInt({ min: 0 }).withMessage('Sort order must be a non-negative integer'),
  body('startYear')
    .optional()
    .isInt({ min: 1900, max: 2100 }).withMessage('Invalid start year'),
  body('endYear')
    .optional()
    .isInt({ min: 1900, max: 2100 }).withMessage('Invalid end year'),
];

export const memberIdValidator = [
  param('orgId').isMongoId().withMessage('Invalid organization ID'),
  param('memberId').isMongoId().withMessage('Invalid member ID'),
];
