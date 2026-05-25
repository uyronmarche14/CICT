import { body, param } from 'express-validator';
import {
  validateBodyHtml,
  validateBodyHtmlRequired,
  validateBodyHtmlContentOr,
  validateContent,
  validateContentRequired,
  validateCoverImage,
  validateExcerpt,
  validateExcerptOptional,
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
  validateArrayField,
  validateBooleanField,
  approvalSummaryNotEditable,
  processInstanceNotEditable,
  publishedAtNotEditable,
  archivedAtNotEditable,
  statusNotEditable,
} from './shared';

export const createNewsValidator = [
  validateTitle(200),

  validateBodyHtml(),

  validateContent(),

  validateBodyHtmlContentOr('content', 'Body content'),

  validateExcerpt(500),

  validateTags(),

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

  body('category')
    .optional()
    .trim(),

  validateBooleanField('featured'),
  validateBooleanField('pinned'),

  validateUrl('sourceUrl'),

  validateArrayField('referenceLinks'),
  validateArrayField('attachmentItems'),

  body('readingTime')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Reading time must be a positive integer'),

  body('authorDisplayName')
    .optional()
    .trim(),

  body('authorRole')
    .optional()
    .trim(),

  body('associatedEventId')
    .optional()
    .isString(),

  body('associatedOrganizationId')
    .optional()
    .isString(),

  body('spotlightLabel')
    .optional()
    .trim(),

  body('seoDescription')
    .optional()
    .trim(),

  body('canonicalSlug')
    .optional()
    .trim(),

  validateArrayField('relatedArticleIds'),
];

export const updateNewsValidator = [
  param('id')
    .isMongoId()
    .withMessage('Invalid news ID'),

  validateTitleOptional(200),

  validateBodyHtmlRequired(),

  validateContentRequired(),

  validateExcerptOptional(500),

  validateTags(),

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

export const newsIdValidator = [
  param('id')
    .isMongoId()
    .withMessage('Invalid news ID'),
];
