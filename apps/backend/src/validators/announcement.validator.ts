import { body, param } from 'express-validator';
import { AnnouncementPriority, AnnouncementType } from '../types';
import {
  validateBodyHtml,
  validateBodyHtmlRequired,
  validateBodyHtmlContentOr,
  validateContent,
  validateContentRequired,
  validateCoverImage,
  validateGallery,
  validateImageUrl,
  validateOrganizationId,
  validateOrganizationIdNullable,
  validateOwnerType,
  validateOwnerTypeAndOrgId,
  validateSections,
  validateTitle,
  validateTitleOptional,
  validateUrl,
  validateContactEmail,
  validateArrayField,
  approvalSummaryNotEditable,
  processInstanceNotEditable,
  publishedAtNotEditable,
  archivedAtNotEditable,
  statusNotEditable,
} from './shared';

export const createAnnouncementValidator = [
  validateTitle(200),

  validateBodyHtml(),

  validateContent(),

  validateBodyHtmlContentOr('content', 'Body content'),

  body('priority')
    .optional()
    .isIn(Object.values(AnnouncementPriority))
    .withMessage('Invalid priority'),

  body('type')
    .optional()
    .isIn(Object.values(AnnouncementType))
    .withMessage('Invalid type'),

  body('targetAudience')
    .optional()
    .toArray()
    .isArray()
    .withMessage('targetAudience must be an array'),

  body('expiresAt')
    .optional({ checkFalsy: true })
    .isISO8601()
    .withMessage('expiresAt must be a valid ISO date'),

  validateImageUrl(),

  validateCoverImage(),

  validateGallery(),

  validateSections(),

  validateOwnerType(),

  validateOrganizationId(),

  validateOwnerTypeAndOrgId(),

  statusNotEditable(),

  approvalSummaryNotEditable(),

  processInstanceNotEditable(),

  body('subtype')
    .optional()
    .trim(),

  body('effectiveDate')
    .optional()
    .isISO8601()
    .withMessage('effectiveDate must be a valid ISO date'),

  body('termStart')
    .optional()
    .isISO8601()
    .withMessage('termStart must be a valid ISO date'),

  body('termEnd')
    .optional()
    .isISO8601()
    .withMessage('termEnd must be a valid ISO date'),

  body('relatedOrganizationId')
    .optional({ checkFalsy: true })
    .isString()
    .withMessage('Related organization ID must be a string'),

  body('relatedEventId')
    .optional({ checkFalsy: true })
    .isMongoId()
    .withMessage('Related event must be a valid event ID'),

  body('approvalSource')
    .optional()
    .trim(),

  body('contactName')
    .optional()
    .trim(),

  validateContactEmail(),

  body('ctaLabel')
    .optional()
    .trim(),

  validateUrl('ctaUrl'),

  validateArrayField('officerItems'),
  validateArrayField('outgoingOfficerItems'),
  validateArrayField('awardItems'),
  validateArrayField('attachmentItems'),
];

export const updateAnnouncementValidator = [
  param('id')
    .isMongoId()
    .withMessage('Invalid announcement ID'),

  validateTitleOptional(200),

  validateBodyHtmlRequired(),

  validateContentRequired(),

  body('priority')
    .optional()
    .isIn(Object.values(AnnouncementPriority))
    .withMessage('Invalid priority'),

  body('type')
    .optional()
    .isIn(Object.values(AnnouncementType))
    .withMessage('Invalid type'),

  body('targetAudience')
    .optional()
    .toArray()
    .isArray()
    .withMessage('targetAudience must be an array'),

  body('expiresAt')
    .optional({ checkFalsy: true })
    .isISO8601()
    .withMessage('expiresAt must be a valid ISO date'),

  validateImageUrl(),

  validateCoverImage(),

  validateGallery(),

  validateSections(),

  validateOwnerType(),

  validateOrganizationIdNullable(),

  statusNotEditable(),

  publishedAtNotEditable(),

  archivedAtNotEditable(),

  approvalSummaryNotEditable(),

  processInstanceNotEditable(),

  body('subtype')
    .optional()
    .trim(),

  body('relatedOrganizationId')
    .optional({ checkFalsy: true })
    .isString()
    .withMessage('Related organization ID must be a string'),

  body('relatedEventId')
    .optional({ checkFalsy: true })
    .isMongoId()
    .withMessage('Related event must be a valid event ID'),
];

export const announcementIdValidator = [
  param('id')
    .isMongoId()
    .withMessage('Invalid announcement ID'),
];
