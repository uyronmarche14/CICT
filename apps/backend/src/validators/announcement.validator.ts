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
];

export const announcementIdValidator = [
  param('id')
    .isMongoId()
    .withMessage('Invalid announcement ID'),
];
