import { body } from 'express-validator';
import { ContentOwnerType } from '../types';
import { sanitizeHtmlContent } from '../utils/sanitize';

export const STATUS_NOT_EDITABLE = 'Use the publish/archive workflow endpoints to change status';
export const APPROVAL_NOT_EDITABLE = 'approvalSummary is managed by workflow endpoints';
export const PROCESS_INSTANCE_NOT_EDITABLE = 'processInstanceId is managed by workflow endpoints';
export const PUBLISHED_AT_NOT_EDITABLE = 'publishedAt is managed by workflow endpoints';
export const ARCHIVED_AT_NOT_EDITABLE = 'archivedAt is managed by workflow endpoints';

export const validateBodyHtml = () =>
  body('bodyHtml')
    .optional()
    .trim()
    .customSanitizer((value: string) => sanitizeHtmlContent(value));

export const validateBodyHtmlRequired = () =>
  body('bodyHtml')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Body content cannot be empty')
    .customSanitizer((value: string) => sanitizeHtmlContent(value));

export const validateOwnerType = () =>
  body('ownerType')
    .optional()
    .isIn(Object.values(ContentOwnerType))
    .withMessage('ownerType must be system or organization');

export const validateOrganizationId = () =>
  body('organizationId')
    .optional({ nullable: true })
    .isString()
    .withMessage('organizationId must be a string');

export const validateOrganizationIdNullable = () =>
  body('organizationId')
    .optional({ nullable: true })
    .custom((value) => value === null || typeof value === 'string')
    .withMessage('organizationId must be a string or null');

export const validateOwnerTypeAndOrgId = () =>
  body().custom((value) => {
    const ownerType =
      value.ownerType === ContentOwnerType.ORGANIZATION
        ? ContentOwnerType.ORGANIZATION
        : ContentOwnerType.SYSTEM;
    const organizationId =
      typeof value.organizationId === 'string' ? value.organizationId.trim() : '';

    if (ownerType === ContentOwnerType.SYSTEM && organizationId) {
      throw new Error('System-owned content cannot include organizationId');
    }

    if (ownerType === ContentOwnerType.ORGANIZATION && !organizationId) {
      throw new Error('organizationId is required for organization-owned content');
    }

    return true;
  });

export const statusNotEditable = () =>
  body('status')
    .not()
    .exists()
    .withMessage(STATUS_NOT_EDITABLE);

export const approvalSummaryNotEditable = () =>
  body('approvalSummary')
    .not()
    .exists()
    .withMessage(APPROVAL_NOT_EDITABLE);

export const processInstanceNotEditable = () =>
  body('processInstanceId')
    .not()
    .exists()
    .withMessage(PROCESS_INSTANCE_NOT_EDITABLE);

export const publishedAtNotEditable = () =>
  body('publishedAt')
    .not()
    .exists()
    .withMessage(PUBLISHED_AT_NOT_EDITABLE);

export const archivedAtNotEditable = () =>
  body('archivedAt')
    .not()
    .exists()
    .withMessage(ARCHIVED_AT_NOT_EDITABLE);

export const validateBodyHtmlContentOr = (otherField: string, otherLabel: string) =>
  body().custom((value) => {
    const bodyHtml = typeof value.bodyHtml === 'string' ? value.bodyHtml.trim() : '';
    const other = typeof value[otherField] === 'string' ? value[otherField].trim() : '';

    if (!bodyHtml && !other) {
      throw new Error(`${otherLabel} is required`);
    }

    return true;
  });

export const validateImageUrl = () =>
  body('imageUrl')
    .optional({ checkFalsy: true })
    .isURL()
    .withMessage('Image URL must be a valid URL');

export const validateCoverImage = () =>
  body('coverImage')
    .optional()
    .isObject()
    .withMessage('Cover image must be an object');

export const validateGallery = () =>
  body('gallery')
    .optional()
    .isArray()
    .withMessage('Gallery must be an array');

export const validateSections = () =>
  body('sections')
    .optional()
    .isArray()
    .withMessage('Sections must be an array');

export const validateTitle = (maxLength: number = 200) =>
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ max: maxLength })
    .withMessage(`Title cannot exceed ${maxLength} characters`);

export const validateTitleOptional = (maxLength: number = 200) =>
  body('title')
    .optional()
    .trim()
    .isLength({ max: maxLength })
    .withMessage(`Title cannot exceed ${maxLength} characters`);

export const validateExcerpt = (maxLength: number = 500) =>
  body('excerpt')
    .trim()
    .notEmpty()
    .withMessage('Excerpt is required')
    .isLength({ max: maxLength })
    .withMessage(`Excerpt cannot exceed ${maxLength} characters`);

export const validateExcerptOptional = (maxLength: number = 500) =>
  body('excerpt')
    .optional()
    .trim()
    .isLength({ max: maxLength })
    .withMessage(`Excerpt cannot exceed ${maxLength} characters`);

export const validateTags = () =>
  body('tags')
    .optional()
    .toArray()
    .isArray()
    .withMessage('Tags must be an array');

export const validateContent = () =>
  body('content')
    .optional()
    .trim();

export const validateContentRequired = () =>
  body('content')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Content cannot be empty');
