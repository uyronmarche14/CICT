import { ContentOwnerType } from '../types';
import { AuthRequest } from '../middleware/auth';
import { hasGlobalPermission } from '../utils/rbac';
import { Permission } from '../types';

export const buildOwnershipFilter = (
  ownerType?: ContentOwnerType,
  organizationId?: string | null
): Record<string, unknown> => {
  const filter: Record<string, unknown> = {};

  if (ownerType) {
    filter.ownerType = ownerType;
  }

  if (organizationId) {
    filter.organizationId = organizationId;
  }

  return filter;
};

export const buildUpdatePayload = <T extends readonly string[]>(
  body: Record<string, unknown>,
  editableFields: T
): Partial<Record<T[number], unknown>> => {
  const updates: Partial<Record<T[number], unknown>> = {};

  for (const field of editableFields) {
    if (body[field] !== undefined) {
      updates[field as T[number]] = body[field];
    }
  }

  return updates;
};

export const canViewUnpublishedContent = (
  req: AuthRequest,
  permission: Permission
): boolean => !!req.user && hasGlobalPermission(req.user, permission);
