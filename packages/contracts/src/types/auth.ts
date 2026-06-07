import type { UserRole } from '../enums/user';
import type { Permission } from '../enums/user';

export type AdminModuleKey =
  | 'dashboard'
  | 'organizations'
  | 'users'
  | 'students'
  | 'events'
  | 'news'
  | 'announcements'
  | 'roles'
  | 'faq'
  | 'logs'
  | 'processes'
  | 'approvals'
  | 'settings';

export type AdminScopes = {
  global: boolean;
  organizations: string[];
};

export type OrganizationAssignment = {
  id: string;
  organizationId: string;
  organizationName?: string;
  roleId: string;
  roleName: string;
  permissions: Permission[];
};

export type PermissionMetadataItem = {
  value: Permission;
  label: string;
  description: string;
};

export type PermissionMetadataGroup = {
  key: string;
  label: string;
  permissions: PermissionMetadataItem[];
};

export type User = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  baseRoleLabel: string;
  customRoleId?: string | null;
  customRole?: {
    id: string;
    name: string;
    description: string;
    permissions: Permission[];
  } | null;
  effectiveRoleLabel: string;
  effectiveRoleKind: 'system' | 'custom';
  effectivePermissions: Permission[];
  canAccessAdmin: boolean;
  adminScopes?: AdminScopes;
  visibleAdminModules?: AdminModuleKey[];
  scopedAdminModulesByOrganization?: Record<string, AdminModuleKey[]>;
  organizationAssignments: OrganizationAssignment[];
  isActive: boolean;
  lastLogin?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type AuthProfile = {
  user: User;
  permissions: Permission[];
  canAccessAdmin: boolean;
  adminScopes?: AdminScopes;
  visibleAdminModules?: AdminModuleKey[];
  scopedAdminModulesByOrganization?: Record<string, AdminModuleKey[]>;
};

export type Role = {
  id: string;
  name: string;
  description: string;
  permissions: Permission[];
  kind: 'system' | 'custom';
  isEditable: boolean;
  isDeletable: boolean;
  systemRoleKey?: UserRole;
  assignedUserCount?: number;
  createdBy?: string | User | null;
  createdAt?: string | null;
  updatedAt?: string | null;
};

export type AuthTokens = {
  accessToken: string;
  refreshToken: string;
};
