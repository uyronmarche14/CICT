import Role from '../models/Role';
import User from '../models/User';
import { getResolvedOrganizationAssignmentsForUser } from './organizationScope';
import {
  AdminModule,
  IAdminAccessPolicy,
  IAdminScopes,
  IAuthenticatedUser,
  IResolvedOrganizationAssignment,
  IScopedAdminModulesByOrganization,
  IUser,
  Permission,
  UserRole,
} from '../types';

export interface SystemRoleDefinition {
  systemRoleKey: UserRole;
  id: string;
  name: string;
  description: string;
  permissions: Permission[];
}

export interface SerializedAuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  studentId?: string | null;
  role: UserRole;
  baseRoleLabel: string;
  customRoleId: string | null;
  customRole: {
    id: string;
    name: string;
    description: string;
    permissions: Permission[];
  } | null;
  effectiveRoleLabel: string;
  effectiveRoleKind: 'system' | 'custom';
  effectivePermissions: Permission[];
  canAccessAdmin: boolean;
  adminAccessPolicy: IAdminAccessPolicy;
  adminScopes: IAdminScopes;
  visibleAdminModules: AdminModule[];
  scopedAdminModulesByOrganization: IScopedAdminModulesByOrganization;
  organizationAssignments: IResolvedOrganizationAssignment[];
  isActive: boolean;
}

import { getCachedUser, setCachedUser, invalidateCachedUser } from './userCache';
import { hasAnyGlobalPermission } from './permission-constants';

export const invalidateUserCache = invalidateCachedUser;

export const SYSTEM_ROLE_DEFINITIONS: SystemRoleDefinition[] = [
  {
    systemRoleKey: UserRole.FULL_ADMIN,
    id: 'system:full_admin',
    name: 'Full Admin',
    description: 'Full administrative access to all protected CMS modules and settings.',
    permissions: Object.values(Permission),
  },
  {
    systemRoleKey: UserRole.SEMI_ADMIN,
    id: 'system:semi_admin',
    name: 'Semi Admin',
    description:
      'Elevated access for managing users, content, organizations, and members without full system control.',
    permissions: [
      Permission.VIEW_USERS,
      Permission.EDIT_USER,
      Permission.SET_USER_STATUS,
      Permission.VIEW_NEWS,
      Permission.CREATE_NEWS,
      Permission.EDIT_NEWS,
      Permission.PUBLISH_NEWS,
      Permission.ARCHIVE_NEWS,
      Permission.VIEW_ANNOUNCEMENT,
      Permission.CREATE_ANNOUNCEMENT,
      Permission.EDIT_ANNOUNCEMENT,
      Permission.PUBLISH_ANNOUNCEMENT,
      Permission.ARCHIVE_ANNOUNCEMENT,
      Permission.VIEW_EVENT,
      Permission.CREATE_EVENT,
      Permission.EDIT_EVENT,
      Permission.PUBLISH_EVENT,
      Permission.CANCEL_EVENT,
      Permission.COMPLETE_EVENT,
      Permission.VIEW_ORGANIZATION,
      Permission.CREATE_ORGANIZATION,
      Permission.EDIT_ORGANIZATION,
      Permission.VIEW_MEMBER,
      Permission.CREATE_MEMBER,
      Permission.EDIT_MEMBER,
      Permission.DELETE_MEMBER,
      Permission.VIEW_ROLE,
      Permission.MANAGE_SETTINGS,
    ],
  },
  {
    systemRoleKey: UserRole.SUPPORT,
    id: 'system:support',
    name: 'Support',
    description: 'Base support account classification with no implicit global admin access.',
    permissions: [],
  },
];

export const getSystemRoleDefinition = (role: UserRole): SystemRoleDefinition => {
  const definition = SYSTEM_ROLE_DEFINITIONS.find(
    (systemRole) => systemRole.systemRoleKey === role
  );

  if (!definition) {
    throw new Error(`Unsupported system role: ${role}`);
  }

  return definition;
};

export const getDefaultPermissions = (role: UserRole): Permission[] =>
  getSystemRoleDefinition(role).permissions;

export const getSystemRoleCatalog = (): SystemRoleDefinition[] => SYSTEM_ROLE_DEFINITIONS;

export const ADMIN_ENTRY_PERMISSIONS: Permission[] = [
  Permission.VIEW_USERS,
  Permission.CREATE_USER,
  Permission.EDIT_USER,
  Permission.DELETE_USER,
  Permission.SET_USER_STATUS,
  Permission.VIEW_STUDENT,
  Permission.CREATE_STUDENT,
  Permission.EDIT_STUDENT,
  Permission.SET_STUDENT_STATUS,
  Permission.VIEW_ACADEMIC_GROUPS,
  Permission.MANAGE_ACADEMIC_GROUPS,
  Permission.VIEW_ROLE,
  Permission.CREATE_ROLE,
  Permission.EDIT_ROLE,
  Permission.DELETE_ROLE,
  Permission.ASSIGN_ROLE,
  Permission.VIEW_ORGANIZATION,
  Permission.CREATE_ORGANIZATION,
  Permission.EDIT_ORGANIZATION,
  Permission.DELETE_ORGANIZATION,
  Permission.VIEW_MEMBER,
  Permission.CREATE_MEMBER,
  Permission.EDIT_MEMBER,
  Permission.DELETE_MEMBER,
  Permission.MANAGE_MEMBER_ROLES,
  Permission.VIEW_NEWS,
  Permission.CREATE_NEWS,
  Permission.EDIT_NEWS,
  Permission.DELETE_NEWS,
  Permission.PUBLISH_NEWS,
  Permission.ARCHIVE_NEWS,
  Permission.VIEW_ANNOUNCEMENT,
  Permission.CREATE_ANNOUNCEMENT,
  Permission.EDIT_ANNOUNCEMENT,
  Permission.DELETE_ANNOUNCEMENT,
  Permission.PUBLISH_ANNOUNCEMENT,
  Permission.ARCHIVE_ANNOUNCEMENT,
  Permission.VIEW_EVENT,
  Permission.CREATE_EVENT,
  Permission.EDIT_EVENT,
  Permission.DELETE_EVENT,
  Permission.PUBLISH_EVENT,
  Permission.CANCEL_EVENT,
  Permission.COMPLETE_EVENT,
  Permission.VIEW_EVENT_REGISTRATIONS,
  Permission.MANAGE_EVENT_REGISTRATIONS,
  Permission.SCAN_EVENT_ATTENDANCE,
  Permission.APPROVE_CONTENT,
  Permission.REJECT_CONTENT,
  Permission.VIEW_PROCESS,
  Permission.CREATE_PROCESS,
  Permission.EDIT_PROCESS,
  Permission.COMMENT_PROCESS,
  Permission.APPROVE_PROCESS_STEP,
  Permission.VIEW_LOGS,
  Permission.MANAGE_SETTINGS,
  Permission.MANAGE_ORG_TASKS,
  Permission.MANAGE_ORG_MEETINGS,
  Permission.MANAGE_ORG_VOTES,
  Permission.MANAGE_ORG_BUDGET,
  Permission.MANAGE_ORG_TEMPLATES,
  Permission.VIEW_ORG_ANALYTICS,
  Permission.MANAGE_ORG_PARTNERSHIPS,
  Permission.MANAGE_ORG_COLLABORATION,
  Permission.SHARE_CONTENT_CROSS_ORG,
  Permission.MANAGE_ORG_TASK_FORCES,
  Permission.MANAGE_ORG_RESOURCE_POOLING,
  Permission.MANAGE_ORG_MENTORSHIP,
  Permission.MANAGE_ORG_ADMINS,
];

export const ORGANIZATION_MANAGEMENT_PERMISSIONS: Permission[] = [
  Permission.VIEW_ORGANIZATION,
  Permission.CREATE_ORGANIZATION,
  Permission.EDIT_ORGANIZATION,
  Permission.DELETE_ORGANIZATION,
  Permission.VIEW_MEMBER,
  Permission.CREATE_MEMBER,
  Permission.EDIT_MEMBER,
  Permission.DELETE_MEMBER,
  Permission.MANAGE_MEMBER_ROLES,
  Permission.MANAGE_ORG_TASKS,
  Permission.MANAGE_ORG_MEETINGS,
  Permission.MANAGE_ORG_VOTES,
  Permission.MANAGE_ORG_BUDGET,
  Permission.MANAGE_ORG_TEMPLATES,
  Permission.MANAGE_ORG_PARTNERSHIPS,
  Permission.MANAGE_ORG_COLLABORATION,
  Permission.SHARE_CONTENT_CROSS_ORG,
  Permission.MANAGE_ORG_TASK_FORCES,
  Permission.MANAGE_ORG_RESOURCE_POOLING,
  Permission.MANAGE_ORG_MENTORSHIP,
  Permission.MANAGE_ORG_ADMINS,
];

const ORGANIZATION_MODULE_PERMISSIONS: Permission[] = [
  ...ORGANIZATION_MANAGEMENT_PERMISSIONS,
];

const ADMIN_MODULE_POLICY: Record<Exclude<AdminModule, 'dashboard'>, Permission[]> = {
  scanner: [Permission.SCAN_EVENT_ATTENDANCE],
  organizations: ORGANIZATION_MODULE_PERMISSIONS,
  users: [
    Permission.VIEW_USERS,
    Permission.CREATE_USER,
    Permission.EDIT_USER,
    Permission.DELETE_USER,
    Permission.SET_USER_STATUS,
  ],
  students: [
    Permission.VIEW_STUDENT,
    Permission.CREATE_STUDENT,
    Permission.EDIT_STUDENT,
    Permission.SET_STUDENT_STATUS,
    Permission.VIEW_ACADEMIC_GROUPS,
    Permission.MANAGE_ACADEMIC_GROUPS,
  ],
  events: [
    Permission.VIEW_EVENT,
    Permission.CREATE_EVENT,
    Permission.EDIT_EVENT,
    Permission.DELETE_EVENT,
    Permission.PUBLISH_EVENT,
    Permission.CANCEL_EVENT,
    Permission.COMPLETE_EVENT,
    Permission.VIEW_EVENT_REGISTRATIONS,
    Permission.MANAGE_EVENT_REGISTRATIONS,
  ],
  news: [
    Permission.VIEW_NEWS,
    Permission.CREATE_NEWS,
    Permission.EDIT_NEWS,
    Permission.DELETE_NEWS,
    Permission.PUBLISH_NEWS,
    Permission.ARCHIVE_NEWS,
  ],
  announcements: [
    Permission.VIEW_ANNOUNCEMENT,
    Permission.CREATE_ANNOUNCEMENT,
    Permission.EDIT_ANNOUNCEMENT,
    Permission.DELETE_ANNOUNCEMENT,
    Permission.PUBLISH_ANNOUNCEMENT,
    Permission.ARCHIVE_ANNOUNCEMENT,
  ],
  roles: [
    Permission.VIEW_ROLE,
    Permission.CREATE_ROLE,
    Permission.EDIT_ROLE,
    Permission.DELETE_ROLE,
    Permission.ASSIGN_ROLE,
  ],
  faq: [Permission.MANAGE_SETTINGS],
  logs: [Permission.VIEW_LOGS],
  processes: [
    Permission.VIEW_PROCESS,
    Permission.CREATE_PROCESS,
    Permission.EDIT_PROCESS,
    Permission.COMMENT_PROCESS,
    Permission.APPROVE_PROCESS_STEP,
  ],
  approvals: [
    Permission.APPROVE_CONTENT,
    Permission.REJECT_CONTENT,
    Permission.MANAGE_MEMBER_ROLES,
    Permission.VIEW_MEMBER,
  ],
  settings: [Permission.MANAGE_SETTINGS],
};

type ScopedAdminModule = Extract<
  AdminModule,
  'scanner' | 'organizations' | 'students' | 'events' | 'news' | 'announcements' | 'approvals'
>;

const SCOPED_MODULES: ScopedAdminModule[] = [
  'scanner',
  'organizations',
  'students',
  'events',
  'news',
  'announcements',
  'approvals',
];

const SCOPED_ADMIN_MODULE_PERMISSION_MAP: Record<ScopedAdminModule, Permission[]> = {
  scanner: ADMIN_MODULE_POLICY.scanner,
  organizations: ORGANIZATION_MANAGEMENT_PERMISSIONS,
  students: ADMIN_MODULE_POLICY.students,
  events: ADMIN_MODULE_POLICY.events,
  news: ADMIN_MODULE_POLICY.news,
  announcements: ADMIN_MODULE_POLICY.announcements,
  approvals: ADMIN_MODULE_POLICY.approvals,
};

const ADMIN_DEFAULT_MODULE_PRIORITY: AdminModule[] = [
  'scanner',
  'events',
  'approvals',
  'students',
  'organizations',
  'users',
  'news',
  'announcements',
  'roles',
  'processes',
  'logs',
  'settings',
  'dashboard',
];

const assignmentHasAnyPermission = (
  assignment: Pick<IResolvedOrganizationAssignment, 'permissions'>,
  permissionsToCheck: Permission[]
): boolean => assignment.permissions.some((permission) => permissionsToCheck.includes(permission));

export const deriveAdminScopes = (
  permissions: Permission[],
  organizationAssignments: IResolvedOrganizationAssignment[] = []
): IAdminScopes => ({
  global: hasAnyGlobalPermission(permissions, ADMIN_ENTRY_PERMISSIONS),
  organizations: organizationAssignments
    .filter((assignment) => assignmentHasAnyPermission(assignment, ADMIN_ENTRY_PERMISSIONS))
    .map((assignment) => assignment.organizationId),
});

export const getScopedOrganizationIdsForPermissions = (
  organizationAssignments: IResolvedOrganizationAssignment[] = [],
  permissionsToCheck: Permission[]
): string[] =>
  Array.from(
    new Set(
      organizationAssignments
        .filter((assignment) => assignmentHasAnyPermission(assignment, permissionsToCheck))
        .map((assignment) => assignment.organizationId)
    )
  );

export const canAccessAdminPanel = (
  permissions: Permission[],
  organizationAssignments: IResolvedOrganizationAssignment[] = []
): boolean => {
  const scopes = deriveAdminScopes(permissions, organizationAssignments);
  return scopes.global || scopes.organizations.length > 0;
};

const deriveModulesFromPermissions = (
  permissions: Permission[]
): Array<Exclude<AdminModule, 'dashboard'>> =>
  (Object.entries(ADMIN_MODULE_POLICY) as Array<
    [Exclude<AdminModule, 'dashboard'>, Permission[]]
  >)
    .filter(([, modulePermissions]) =>
      modulePermissions.some((permission) => permissions.includes(permission))
    )
    .map(([module]) => module);

const uniquePermissions = (permissions: Permission[]): Permission[] => Array.from(new Set(permissions));

const deriveScopedActionsByOrganization = (
  organizationAssignments: IResolvedOrganizationAssignment[] = []
): Record<string, Permission[]> =>
  organizationAssignments.reduce<Record<string, Permission[]>>((accumulator, assignment) => {
    accumulator[assignment.organizationId] = uniquePermissions(assignment.permissions);
    return accumulator;
  }, {});

export const deriveScopedAdminModulesByOrganization = (
  organizationAssignments: IResolvedOrganizationAssignment[] = []
): IScopedAdminModulesByOrganization => {
  return organizationAssignments.reduce<IScopedAdminModulesByOrganization>(
    (accumulator, assignment) => {
      const modules = SCOPED_MODULES.filter((module) =>
        assignment.permissions.some((permission) =>
          SCOPED_ADMIN_MODULE_PERMISSION_MAP[module].includes(permission)
        )
      );

      if (modules.length > 0) {
        accumulator[assignment.organizationId] = modules;
      }

      return accumulator;
    },
    {}
  );
};

export const deriveVisibleAdminModules = (
  permissions: Permission[],
  organizationAssignments: IResolvedOrganizationAssignment[] = []
): AdminModule[] => {
  const modules = new Set<AdminModule>();
  const globalModules = deriveModulesFromPermissions(permissions);
  const scopedModulesByOrganization =
    deriveScopedAdminModulesByOrganization(organizationAssignments);

  if (
    globalModules.length > 0 ||
    Object.keys(scopedModulesByOrganization).length > 0 ||
    canAccessAdminPanel(permissions, organizationAssignments)
  ) {
    modules.add('dashboard');
  }

  for (const module of globalModules) {
    modules.add(module);
  }

  for (const scopedModules of Object.values(scopedModulesByOrganization)) {
    for (const module of scopedModules) {
      modules.add(module);
    }
  }

  return Array.from(modules);
};

export const deriveAdminAccessPolicy = (
  permissions: Permission[],
  organizationAssignments: IResolvedOrganizationAssignment[] = []
): IAdminAccessPolicy => {
  const visibleAdminModules = deriveVisibleAdminModules(permissions, organizationAssignments);
  const scopedAdminModulesByOrganization =
    deriveScopedAdminModulesByOrganization(organizationAssignments);
  const canAccessAdmin = canAccessAdminPanel(permissions, organizationAssignments);
  const defaultAdminModule =
    ADMIN_DEFAULT_MODULE_PRIORITY.find((module) => visibleAdminModules.includes(module)) ??
    'settings';

  return {
    canAccessAdmin,
    visibleAdminModules,
    scopedAdminModulesByOrganization,
    globalActions: uniquePermissions(permissions),
    scopedActionsByOrganization: deriveScopedActionsByOrganization(organizationAssignments),
    defaultAdminModule,
  };
};

export const resolvePermissionsForRoleContext = async (
  role: UserRole,
  customRoleId?: string | null
): Promise<Permission[]> => {
  if (customRoleId) {
    const customRole = await Role.findById(customRoleId).select('permissions');
    if (!customRole) {
      throw new Error('Assigned custom role no longer exists');
    }

    return customRole.permissions;
  }

  return getDefaultPermissions(role);
};

const getSystemRoleLabel = (role: UserRole): string => getSystemRoleDefinition(role).name;

const serializeCustomRole = (customRole: {
  _id?: unknown;
  id?: unknown;
  name?: string;
  description?: string;
  permissions?: Permission[];
} | null | undefined) => {
  if (!customRole?.name) {
    return null;
  }

  return {
    id: String(customRole._id ?? customRole.id),
    name: customRole.name,
    description: customRole.description ?? '',
    permissions: customRole.permissions ?? [],
  };
};

const resolveSerializedCustomRole = async (
  user: IUser | IAuthenticatedUser | SerializedAuthUser
): Promise<SerializedAuthUser['customRole']> => {
  if (
    'customRole' in user &&
    typeof user.customRole === 'object' &&
    user.customRole !== null &&
    'name' in user.customRole
  ) {
    return serializeCustomRole(user.customRole);
  }

  const customRoleId =
    'customRoleId' in user
      ? user.customRoleId
      : 'customRole' in user
        ? (typeof user.customRole === 'string'
            ? user.customRole
            : (user.customRole as { toString?: () => string } | undefined)?.toString?.()) ?? null
        : null;

  if (!customRoleId) {
    return null;
  }

  const customRole = await Role.findById(customRoleId).select('name description permissions');
  if (!customRole) {
    return null;
  }

  return serializeCustomRole(customRole);
};

export const buildAuthenticatedUser = async (
  user: IUser,
  skipCache?: boolean
): Promise<IAuthenticatedUser> => {
  const userId = String(user._id);

  if (!skipCache) {
    const cached = await getCachedUser(userId);
    if (cached) {
      return cached;
    }
  }

  const customRoleId =
    (user.customRole as { toString?: () => string } | undefined)?.toString?.() ?? null;
  const customRole = customRoleId
    ? await Role.findById(customRoleId).select('name description permissions')
    : null;

  if (customRoleId && !customRole) {
    throw new Error('Assigned custom role no longer exists');
  }

  const permissions = customRole?.permissions ?? getDefaultPermissions(user.role);
  const serializedCustomRole = serializeCustomRole(customRole);
  const effectiveRoleLabel = serializedCustomRole?.name ?? getSystemRoleLabel(user.role);
  const organizationAssignments = await getResolvedOrganizationAssignmentsForUser(
    String(user._id)
  );
  const adminScopes = deriveAdminScopes(permissions, organizationAssignments);
  const adminAccessPolicy = deriveAdminAccessPolicy(permissions, organizationAssignments);

  const result: IAuthenticatedUser = {
    userId: String(user._id),
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    studentId:
      (user.studentId as { toString?: () => string } | undefined)?.toString?.() ?? undefined,
    role: user.role,
    customRole: customRoleId ?? undefined,
    customRoleDetails: serializedCustomRole,
    permissions,
    baseRoleLabel: getSystemRoleLabel(user.role),
    effectiveRoleLabel,
    effectiveRoleKind: serializedCustomRole ? 'custom' : 'system',
    canAccessAdmin: adminAccessPolicy.canAccessAdmin,
    adminAccessPolicy,
    adminScopes,
    visibleAdminModules: adminAccessPolicy.visibleAdminModules,
    scopedAdminModulesByOrganization: adminAccessPolicy.scopedAdminModulesByOrganization,
    organizationAssignments,
    isActive: user.isActive,
  };

  await setCachedUser(userId, result);
  return result;
};

export const serializeAuthUser = async (
  user: IUser | IAuthenticatedUser | SerializedAuthUser
): Promise<SerializedAuthUser> => {
  const customRole = await resolveSerializedCustomRole(user);
  const inheritedPermissions =
    'permissions' in user && Array.isArray(user.permissions) ? user.permissions : undefined;

  if ('id' in user) {
    const effectivePermissions =
      user.effectivePermissions ??
      inheritedPermissions ??
      customRole?.permissions ??
      getDefaultPermissions(user.role);
    const organizationAssignments = user.organizationAssignments ?? [];
    const adminScopes = user.adminScopes ?? deriveAdminScopes(effectivePermissions, organizationAssignments);
    const adminAccessPolicy =
      user.adminAccessPolicy ?? deriveAdminAccessPolicy(effectivePermissions, organizationAssignments);
    const visibleAdminModules =
      user.visibleAdminModules ?? adminAccessPolicy.visibleAdminModules;
    const scopedAdminModulesByOrganization =
      user.scopedAdminModulesByOrganization ??
      adminAccessPolicy.scopedAdminModulesByOrganization;

    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      studentId: user.studentId ?? null,
      role: user.role,
      baseRoleLabel: user.baseRoleLabel ?? getSystemRoleLabel(user.role),
      customRoleId: user.customRoleId,
      customRole,
      effectiveRoleLabel: user.effectiveRoleLabel ?? customRole?.name ?? getSystemRoleLabel(user.role),
      effectiveRoleKind: user.effectiveRoleKind ?? (customRole ? 'custom' : 'system'),
      effectivePermissions,
      canAccessAdmin: user.canAccessAdmin ?? adminAccessPolicy.canAccessAdmin,
      adminAccessPolicy,
      adminScopes,
      visibleAdminModules,
      scopedAdminModulesByOrganization,
      organizationAssignments,
      isActive: user.isActive,
    };
  }

  if ('userId' in user) {
    const organizationAssignments = user.organizationAssignments ?? [];
    const adminScopes = user.adminScopes ?? deriveAdminScopes(user.permissions, organizationAssignments);
    const adminAccessPolicy =
      user.adminAccessPolicy ?? deriveAdminAccessPolicy(user.permissions, organizationAssignments);
    const visibleAdminModules =
      user.visibleAdminModules ?? adminAccessPolicy.visibleAdminModules;
    const scopedAdminModulesByOrganization =
      user.scopedAdminModulesByOrganization ??
      adminAccessPolicy.scopedAdminModulesByOrganization;
    return {
      id: user.userId,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      studentId: user.studentId ?? null,
      role: user.role,
      baseRoleLabel: user.baseRoleLabel ?? getSystemRoleLabel(user.role),
      customRoleId: user.customRole ?? null,
      customRole,
      effectiveRoleLabel: user.effectiveRoleLabel ?? customRole?.name ?? getSystemRoleLabel(user.role),
      effectiveRoleKind: user.effectiveRoleKind ?? (customRole ? 'custom' : 'system'),
      effectivePermissions: user.permissions,
      canAccessAdmin: user.canAccessAdmin ?? adminAccessPolicy.canAccessAdmin,
      adminAccessPolicy,
      adminScopes,
      visibleAdminModules,
      scopedAdminModulesByOrganization,
      organizationAssignments,
      isActive: user.isActive,
    };
  }

  const customRoleId =
    ((user.customRole as { toString?: () => string } | undefined)?.toString?.() ?? null);
  const effectivePermissions = customRole?.permissions ?? getDefaultPermissions(user.role);
  const adminScopes = deriveAdminScopes(effectivePermissions, []);
  const adminAccessPolicy = deriveAdminAccessPolicy(effectivePermissions, []);
  const visibleAdminModules = adminAccessPolicy.visibleAdminModules;
  const scopedAdminModulesByOrganization = adminAccessPolicy.scopedAdminModulesByOrganization;

  return {
    id: String(user._id),
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    studentId:
      (user.studentId as { toString?: () => string } | undefined)?.toString?.() ?? null,
    role: user.role,
    baseRoleLabel: getSystemRoleLabel(user.role),
    customRoleId,
    customRole,
    effectiveRoleLabel: customRole?.name ?? getSystemRoleLabel(user.role),
    effectiveRoleKind: customRole ? 'custom' : 'system',
    effectivePermissions,
    canAccessAdmin: adminAccessPolicy.canAccessAdmin,
    adminAccessPolicy,
    adminScopes,
    visibleAdminModules,
    scopedAdminModulesByOrganization,
    organizationAssignments: [],
    isActive: user.isActive,
  };
};

export const findActiveFullAdminCount = async (): Promise<number> =>
  User.countDocuments({ role: UserRole.FULL_ADMIN, isActive: true });

export { hasGlobalPermission, hasAnyGlobalPermission } from './permission-constants';
