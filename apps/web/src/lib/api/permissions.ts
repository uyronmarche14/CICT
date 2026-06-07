import api from './axios';
import {
  Permission,
  PermissionMetadataGroup,
  PermissionMetadataItem,
} from '@/types';
import { fallbackPermissionMetadataGroups } from '@/lib/permissions/catalog';

const groupPermissionMetadata = (
  items: Array<PermissionMetadataItem & { group?: string }>
): PermissionMetadataGroup[] => {
  const groups = new Map<string, PermissionMetadataGroup>();

  items.forEach((item) => {
    const key = item.group?.trim().toLowerCase() || 'general';
    const label = item.group?.trim() || 'General';
    const existingGroup = groups.get(key);

    if (existingGroup) {
      existingGroup.permissions.push({
        value: item.value,
        label: item.label,
        description: item.description,
      });
      return;
    }

    groups.set(key, {
      key,
      label,
      permissions: [
        {
          value: item.value,
          label: item.label,
          description: item.description,
        },
      ],
    });
  });

  return Array.from(groups.values());
};

const normalizePermissionMetadata = (payload: unknown): PermissionMetadataGroup[] => {
  if (!payload) {
    return fallbackPermissionMetadataGroups;
  }

  if (Array.isArray(payload)) {
    const isGroupShape = payload.every(
      (group) =>
        typeof group === 'object' &&
        group !== null &&
        'label' in group &&
        'permissions' in group &&
        Array.isArray((group as { permissions?: unknown[] }).permissions)
    );

    if (isGroupShape) {
      return payload as PermissionMetadataGroup[];
    }

    const isFlatShape = payload.every(
      (item) =>
        typeof item === 'object' &&
        item !== null &&
        'value' in item &&
        'label' in item &&
        'description' in item
    );

    if (isFlatShape) {
      return groupPermissionMetadata(
        payload as Array<PermissionMetadataItem & { group?: string }>
      );
    }
  }

  if (typeof payload === 'object' && payload !== null) {
    const record = payload as {
      groups?: unknown;
      permissions?: unknown;
    };

    if (record.groups) {
      return normalizePermissionMetadata(record.groups);
    }

    if (record.permissions) {
      return normalizePermissionMetadata(record.permissions);
    }
  }

  return fallbackPermissionMetadataGroups;
};

export const permissionsMetadataAPI = {
  getAll: async (): Promise<PermissionMetadataGroup[]> => {
    try {
      const response = await api.get<{ success?: boolean; data?: unknown }>('/auth/permission-metadata');
      return normalizePermissionMetadata(response.data.data);
    } catch {
      return fallbackPermissionMetadataGroups;
    }
  },

  getFallback: () => fallbackPermissionMetadataGroups,

  getGroupedPreviewCounts: (
    permissions: Permission[],
    groups: PermissionMetadataGroup[] = fallbackPermissionMetadataGroups
  ) =>
    groups
      .map((group) => ({
        key: group.key,
        label: group.label,
        count: group.permissions.filter((permission) =>
          permissions.includes(permission.value)
        ).length,
      }))
      .filter((group) => group.count > 0),
};
