import { param } from 'express-validator';
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
