import { useCallback, useMemo } from 'react';
import { useAuth } from '@/context/AuthContext';
import { AdminModuleKey, ContentOwnerType, Permission } from '@/types';

const NEWS_MODULE_PERMISSIONS: Permission[] = [
  Permission.VIEW_NEWS,
  Permission.CREATE_NEWS,
  Permission.EDIT_NEWS,
  Permission.DELETE_NEWS,
  Permission.PUBLISH_NEWS,
  Permission.ARCHIVE_NEWS,
];

const ANNOUNCEMENTS_MODULE_PERMISSIONS: Permission[] = [
  Permission.VIEW_ANNOUNCEMENT,
  Permission.CREATE_ANNOUNCEMENT,
  Permission.EDIT_ANNOUNCEMENT,
  Permission.DELETE_ANNOUNCEMENT,
  Permission.PUBLISH_ANNOUNCEMENT,
  Permission.ARCHIVE_ANNOUNCEMENT,
];

const EVENTS_MODULE_PERMISSIONS: Permission[] = [
  Permission.VIEW_EVENT,
  Permission.CREATE_EVENT,
  Permission.EDIT_EVENT,
  Permission.DELETE_EVENT,
  Permission.PUBLISH_EVENT,
  Permission.CANCEL_EVENT,
  Permission.COMPLETE_EVENT,
];

const ORGANIZATION_MANAGEMENT_PERMISSIONS: Permission[] = [
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
];

const MODULE_KEYS: AdminModuleKey[] = [
  'dashboard',
  'organizations',
  'users',
  'students',
  'events',
  'news',
  'announcements',
  'roles',
  'faq',
  'logs',
  'processes',
  'approvals',
  'settings',
];

const unique = <T,>(values: T[]) => Array.from(new Set(values));

const normalizeVisibleModules = (modules: string[] | undefined): AdminModuleKey[] =>
  (modules ?? []).filter((module): module is AdminModuleKey =>
    MODULE_KEYS.includes(module as AdminModuleKey)
  );

export const usePermissions = () => {
  const { permissions, isAuthenticated, user, canAccessAdmin } = useAuth();
  const organizationAssignments = useMemo(
    () => user?.organizationAssignments ?? [],
    [user?.organizationAssignments]
  );
  const adminScopes = user?.adminScopes;

  const hasPermission = useCallback(
    (permission: Permission) => permissions.includes(permission),
    [permissions]
  );
  const hasScopedPermission = useCallback((organizationId: string, permission: Permission) =>
    organizationAssignments.some(
      (assignment) =>
        assignment.organizationId === organizationId && assignment.permissions.includes(permission)
    ),
    [organizationAssignments]
  );
  const hasAnyScopedPermission = useCallback(
    (permission: Permission) =>
      organizationAssignments.some((assignment) => assignment.permissions.includes(permission)),
    [organizationAssignments]
  );
  const hasAnyScopedAssignment = organizationAssignments.length > 0;
  const hasAnyPermission = useCallback(
    (required: Permission[]) => required.some((permission) => hasPermission(permission)),
    [hasPermission]
  );
  const hasAllPermissions = (required: Permission[]) =>
    required.every((permission) => hasPermission(permission));
  const hasAnyGlobalOrScopedPermission = (permission: Permission) =>
    hasPermission(permission) || hasAnyScopedPermission(permission);
  const hasAnyGlobalOrScopedPermissions = (required: Permission[]) =>
    required.some((permission) => hasAnyGlobalOrScopedPermission(permission));

  const getScopedOrganizationIds = () =>
    unique(organizationAssignments.map((assignment) => assignment.organizationId));

  const getScopedOrganizationIdsForPermission = (permission: Permission) =>
    unique(
      organizationAssignments
        .filter((assignment) => assignment.permissions.includes(permission))
        .map((assignment) => assignment.organizationId)
    );

  const getScopedOrganizationIdsForPermissions = (required: Permission[]) =>
    unique(
      organizationAssignments
        .filter((assignment) =>
          required.some((permission) => assignment.permissions.includes(permission))
        )
        .map((assignment) => assignment.organizationId)
    );

  const scopedAdminModulesByOrganization = useMemo(() => {
    if (user?.scopedAdminModulesByOrganization) {
      return Object.fromEntries(
        Object.entries(user.scopedAdminModulesByOrganization).map(([organizationId, modules]) => [
          organizationId,
          normalizeVisibleModules(modules),
        ])
      );
    }

    const derivedEntries = organizationAssignments.map((assignment) => {
      const modules = new Set<AdminModuleKey>();

      if (assignment.permissions.some((permission) => NEWS_MODULE_PERMISSIONS.includes(permission))) {
        modules.add('news');
      }

      if (
        assignment.permissions.some((permission) =>
          ANNOUNCEMENTS_MODULE_PERMISSIONS.includes(permission)
        )
      ) {
        modules.add('announcements');
      }

      if (assignment.permissions.some((permission) => EVENTS_MODULE_PERMISSIONS.includes(permission))) {
        modules.add('events');
      }

      if (
        assignment.permissions.some((permission) => ORGANIZATION_MANAGEMENT_PERMISSIONS.includes(permission))
      ) {
        modules.add('organizations');
      }

      return [assignment.organizationId, Array.from(modules)] as const;
    });

    return Object.fromEntries(derivedEntries);
  }, [organizationAssignments, user?.scopedAdminModulesByOrganization]);

  const visibleAdminModules = useMemo(
    () => normalizeVisibleModules(user?.visibleAdminModules),
    [user?.visibleAdminModules]
  );

  const hasVisibleAdminModule = (module: AdminModuleKey) => visibleAdminModules.includes(module);
  const hasScopedAdminModule = (organizationId: string, module: AdminModuleKey) =>
    scopedAdminModulesByOrganization[organizationId]?.includes(module) ?? false;

  const canAccessOrganization = (organizationId: string) =>
    hasVisibleAdminModule('organizations') &&
    (adminScopes?.global || hasScopedAdminModule(organizationId, 'organizations'));

  const canReadOrganizations = () => hasVisibleAdminModule('organizations');
  const canCreateOrganization = () => hasPermission(Permission.CREATE_ORGANIZATION);
  const canUpdateOrganization = (organizationId?: string) =>
    hasPermission(Permission.EDIT_ORGANIZATION) ||
    (organizationId ? hasScopedPermission(organizationId, Permission.EDIT_ORGANIZATION) : false);
  const canDeleteOrganization = (organizationId?: string) =>
    hasPermission(Permission.DELETE_ORGANIZATION) ||
    (organizationId
      ? hasScopedPermission(organizationId, Permission.DELETE_ORGANIZATION)
      : false);
  const canManageOrganizationMembers = (organizationId?: string) =>
    [
      Permission.VIEW_MEMBER,
      Permission.CREATE_MEMBER,
      Permission.EDIT_MEMBER,
      Permission.DELETE_MEMBER,
    ].some((permission) => hasPermission(permission)) ||
    (organizationId
      ? [
          Permission.VIEW_MEMBER,
          Permission.CREATE_MEMBER,
          Permission.EDIT_MEMBER,
          Permission.DELETE_MEMBER,
        ].some((permission) => hasScopedPermission(organizationId, permission))
      : Object.keys(scopedAdminModulesByOrganization).some((orgId) =>
          hasScopedAdminModule(orgId, 'organizations')
        ));
  const canManageOrganizationTool = (organizationId: string, permission: Permission) =>
    hasPermission(permission) || hasScopedPermission(organizationId, permission);
  const hasAnyOrganizationToolPermission = (permission: Permission) =>
    hasPermission(permission) || hasAnyScopedPermission(permission);

  return {
    permissions,
    organizationAssignments,
    adminScopes,
    visibleAdminModules,
    scopedAdminModulesByOrganization,
    hasPermission,
    hasScopedPermission,
    hasAnyScopedPermission,
    hasAnyScopedAssignment,
    hasAnyPermission,
    hasAllPermissions,
    hasAnyGlobalOrScopedPermission,
    hasAnyGlobalOrScopedPermissions,
    hasVisibleAdminModule,
    hasScopedAdminModule,
    getVisibleAdminModules: () => visibleAdminModules,
    getScopedOrganizationIds,
    getScopedOrganizationIdsForPermission,
    getScopedOrganizationIdsForPermissions,
    getUserPermissions: () => permissions,
    getAssignableOrganizations: () => organizationAssignments,
    isAuthenticated,
    canAccessAdmin,
    isGuest: !isAuthenticated,
    canCreateUser: () => hasPermission(Permission.CREATE_USER),
    canReadUsers: () => hasPermission(Permission.VIEW_USERS),
    canUpdateUser: () => hasPermission(Permission.EDIT_USER),
    canDeleteUser: () => hasPermission(Permission.DELETE_USER),
    canSetUserStatus: () => hasPermission(Permission.SET_USER_STATUS),
    canUpdateOwnProfile: () => isAuthenticated,
    canAccessUsersModule: () => hasVisibleAdminModule('users'),
    canReadStudents: () => hasPermission(Permission.VIEW_STUDENT),
    canCreateStudent: () => hasPermission(Permission.CREATE_STUDENT),
    canUpdateStudent: () => hasPermission(Permission.EDIT_STUDENT),
    canSetStudentStatus: () => hasPermission(Permission.SET_STUDENT_STATUS),
    canViewAcademicGroups: () =>
      hasPermission(Permission.VIEW_ACADEMIC_GROUPS) ||
      hasPermission(Permission.MANAGE_ACADEMIC_GROUPS),
    canManageAcademicGroups: () => hasPermission(Permission.MANAGE_ACADEMIC_GROUPS),
    canAccessStudentsModule: () => hasVisibleAdminModule('students'),
    canCreateRole: () => hasPermission(Permission.CREATE_ROLE),
    canReadRoles: () => hasPermission(Permission.VIEW_ROLE),
    canUpdateRole: () => hasPermission(Permission.EDIT_ROLE),
    canDeleteRole: () => hasPermission(Permission.DELETE_ROLE),
    canAccessRolesModule: () => hasVisibleAdminModule('roles'),
    canManageSettings: () =>
      hasVisibleAdminModule('faq') || hasPermission(Permission.MANAGE_SETTINGS),
    canReadOrganizations,
    canCreateOrganization,
    canUpdateOrganization,
    canDeleteOrganization,
    canManageOrganizationMembers,
    canManageOrganizationTool,
    canManageOrgTasks: (organizationId: string) =>
      canManageOrganizationTool(organizationId, Permission.MANAGE_ORG_TASKS),
    canManageOrgMeetings: (organizationId: string) =>
      canManageOrganizationTool(organizationId, Permission.MANAGE_ORG_MEETINGS),
    canManageOrgVotes: (organizationId: string) =>
      canManageOrganizationTool(organizationId, Permission.MANAGE_ORG_VOTES),
    canManageOrgBudget: (organizationId: string) =>
      canManageOrganizationTool(organizationId, Permission.MANAGE_ORG_BUDGET),
    canManageOrgTemplates: () => hasPermission(Permission.MANAGE_ORG_TEMPLATES),
    canManageOrgAnalytics: (organizationId: string) =>
      canManageOrganizationTool(organizationId, Permission.VIEW_ORG_ANALYTICS),
    hasAnyOrgTasksAccess: () => hasAnyOrganizationToolPermission(Permission.MANAGE_ORG_TASKS),
    hasAnyOrgMeetingsAccess: () =>
      hasAnyOrganizationToolPermission(Permission.MANAGE_ORG_MEETINGS),
    hasAnyOrgVotesAccess: () => hasAnyOrganizationToolPermission(Permission.MANAGE_ORG_VOTES),
    hasAnyOrgBudgetAccess: () => hasAnyOrganizationToolPermission(Permission.MANAGE_ORG_BUDGET),
    hasAnyOrgTemplatesAccess: () =>
      hasPermission(Permission.MANAGE_ORG_TEMPLATES),
    canAccessOrganization,
    canAccessOrganizationsModule: () => hasVisibleAdminModule('organizations'),
    canManageOrganizationContent: (
      organizationId: string,
      permission: Permission,
      ownerType: ContentOwnerType = ContentOwnerType.ORGANIZATION
    ) =>
      ownerType === ContentOwnerType.SYSTEM
        ? hasPermission(permission)
        : hasPermission(permission) || hasScopedPermission(organizationId, permission),
    canCreateSystemOwnedContent: (permission: Permission) => hasPermission(permission),
    canAccessNewsModule: () => hasVisibleAdminModule('news'),
    canAccessAnnouncementsModule: () => hasVisibleAdminModule('announcements'),
    canAccessEventsModule: () => hasVisibleAdminModule('events'),
    canAccessLogsModule: () => hasVisibleAdminModule('logs'),
    canAccessProcessesModule: () => hasVisibleAdminModule('processes'),
    canAccessApprovalsModule: () =>
      hasVisibleAdminModule('approvals') ||
      hasPermission(Permission.APPROVE_CONTENT) ||
      hasPermission(Permission.REJECT_CONTENT) ||
      hasAnyScopedPermission(Permission.APPROVE_CONTENT) ||
      hasAnyScopedPermission(Permission.REJECT_CONTENT),
    canCreateAnnouncement: () => hasPermission(Permission.CREATE_ANNOUNCEMENT),
    canPublishAnnouncement: () => hasPermission(Permission.PUBLISH_ANNOUNCEMENT),
    canArchiveAnnouncement: () => hasPermission(Permission.ARCHIVE_ANNOUNCEMENT),
    canPublishNews: () => hasPermission(Permission.PUBLISH_NEWS),
    canArchiveNews: () => hasPermission(Permission.ARCHIVE_NEWS),
    canPublishEvent: () => hasPermission(Permission.PUBLISH_EVENT),
    canCancelEvent: () => hasPermission(Permission.CANCEL_EVENT),
    canCompleteEvent: () => hasPermission(Permission.COMPLETE_EVENT),
  };
};
