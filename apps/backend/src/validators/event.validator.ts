import { body, param } from 'express-validator';
import {
  validateBodyHtml,
  validateBodyHtmlRequired,
  validateBodyHtmlContentOr,
  validateCoverImage,
  validateExcerpt,
  validateGallery,
  validateImageUrl,
  validateOrganizationId,
  validateOrganizationIdNullable,
  validateOwnerType,
  validateOwnerTypeAndOrgId,
  validateSections,
  validateTags,
  validateTitle,
  validateTitleOptional,
  validateUrl,
  validateContactEmail,
  validateArrayField,
  approvalSummaryNotEditable,
  processInstanceNotEditable,
  publishedAtNotEditable,
  statusNotEditable,
} from './shared';

export const createEventValidator = [
  validateTitle(100),

  validateBodyHtml(),

  body('description')
    .optional()
    .trim(),

  validateBodyHtmlContentOr('description', 'Description'),

  validateExcerpt(200),

  body('startDate')
    .notEmpty()
    .withMessage('Start date is required')
    .isISO8601()
    .withMessage('Start date must be a valid date'),

  body('endDate')
    .notEmpty()
    .withMessage('End date is required')
    .isISO8601()
    .withMessage('End date must be a valid date'),

  body('location')
    .trim()
    .notEmpty()
    .withMessage('Location is required'),

  validateTags(),

  validateImageUrl(),

  validateCoverImage(),

  validateGallery(),

  validateSections(),

  body('schedule')
    .optional()
    .isArray()
    .withMessage('Schedule must be an array'),

  validateOwnerType(),

  validateOrganizationId(),

  validateOwnerTypeAndOrgId(),

  statusNotEditable(),

  approvalSummaryNotEditable(),

  processInstanceNotEditable(),

  body('maxAttendees')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Max attendees must be a positive integer'),

  validateUrl('registrationUrl'),
  validateUrl('mapUrl'),
  validateUrl('meetingUrl'),

  body('registrationDeadline')
    .optional()
    .isISO8601()
    .withMessage('Registration deadline must be a valid date'),

  body('contactName')
    .optional()
    .trim(),

  validateContactEmail(),

  body('contactPhone')
    .optional()
    .trim(),

  validateArrayField('hostOrganizationIds'),
  body('hostOrganizationIds.*')
    .optional()
    .isString()
    .withMessage('Host organization IDs must be strings'),
  validateArrayField('coHostOrganizationIds'),
  body('coHostOrganizationIds.*')
    .optional()
    .isString()
    .withMessage('Co-host organization IDs must be strings'),
  validateArrayField('speakerItems'),

  body('audience')
    .optional()
    .trim(),

  body('eligibility')
    .optional()
    .trim(),

  body('feeLabel')
    .optional()
    .trim(),

  body('certificateInfo')
    .optional()
    .trim(),

  body('venueDetails')
    .optional()
    .isObject()
    .withMessage('Venue details must be an object'),

  body('requirements')
    .optional()
    .trim(),

  validateArrayField('attachmentItems'),

  body('posterCaption')
    .optional()
    .trim(),
];

export const updateEventValidator = [
  param('id')
    .isMongoId()
    .withMessage('Invalid event ID'),

  validateTitleOptional(100),

  validateBodyHtmlRequired(),

  body('description')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Description cannot be empty'),

  body('startDate')
    .optional()
    .isISO8601()
    .withMessage('Start date must be a valid date'),

  body('endDate')
    .optional()
    .isISO8601()
    .withMessage('End date must be a valid date'),

  validateTags(),

  validateImageUrl(),

  validateCoverImage(),

  validateGallery(),

  validateSections(),

  body('schedule')
    .optional()
    .isArray()
    .withMessage('Schedule must be an array'),

  validateOwnerType(),

  validateOrganizationIdNullable(),

  statusNotEditable(),

  publishedAtNotEditable(),

  body('cancelledAt')
    .not()
    .exists()
    .withMessage('cancelledAt is managed by workflow endpoints'),

  body('completedAt')
    .not()
    .exists()
    .withMessage('completedAt is managed by workflow endpoints'),

  approvalSummaryNotEditable(),

  processInstanceNotEditable(),

  body('maxAttendees')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Max attendees must be a positive integer'),

  validateArrayField('hostOrganizationIds'),
  body('hostOrganizationIds.*')
    .optional()
    .isString()
    .withMessage('Host organization IDs must be strings'),

  validateArrayField('coHostOrganizationIds'),
  body('coHostOrganizationIds.*')
    .optional()
    .isString()
    .withMessage('Co-host organization IDs must be strings'),
];

export const eventIdValidator = [
  param('id')
    .isMongoId()
    .withMessage('Invalid event ID'),
];

export const eventRegIdValidator = [
  param('id')
    .isMongoId()
    .withMessage('Invalid event ID'),
  param('regId')
    .isMongoId()
    .withMessage('Invalid registration ID'),
];
