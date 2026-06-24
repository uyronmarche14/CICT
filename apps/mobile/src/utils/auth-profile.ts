import type { AuthProfile } from '@/types/api';
import type { MobileAdminTabKey } from '@/utils/admin-access';
import { canUseAdminTab } from '@/utils/admin-access';

const ADMIN_TAB_PRIORITY: MobileAdminTabKey[] = [
  'scanner',
  'events',
  'approvals',
  'students',
  'organizations',
  'dashboard',
  'settings',
];

const ADMIN_MODULE_ROUTES: Record<MobileAdminTabKey, string> = {
  dashboard: '/(admin)/dashboard',
  scanner: '/(admin)/scanner',
  events: '/(admin)/events',
  approvals: '/(admin)/approvals',
  students: '/(admin)/students',
  organizations: '/(admin)/organizations',
  settings: '/(admin)/settings',
};

export function normalizeAuthProfile(
  value: Partial<AuthProfile> & { user?: Partial<AuthProfile['user']> },
  fallback?: AuthProfile | null
): AuthProfile {
  const fallbackUser = fallback?.user;
  const user = value.user ?? fallbackUser;

  if (!user) {
    throw new Error('Admin profile is missing user data');
  }

  const effectivePermissions =
    value.permissions ??
    user.effectivePermissions ??
    fallback?.permissions ??
    fallbackUser?.effectivePermissions ??
    [];
  const canAccessAdmin =
    value.canAccessAdmin ??
    user.canAccessAdmin ??
    fallback?.canAccessAdmin ??
    fallbackUser?.canAccessAdmin ??
    false;
  const adminAccessPolicy =
    value.adminAccessPolicy ??
    user.adminAccessPolicy ??
    fallback?.adminAccessPolicy ??
    fallbackUser?.adminAccessPolicy;
  const adminScopes = value.adminScopes ?? user.adminScopes ?? fallback?.adminScopes;
  const visibleAdminModules =
    value.visibleAdminModules ??
    user.visibleAdminModules ??
    adminAccessPolicy?.visibleAdminModules ??
    fallback?.visibleAdminModules ??
    [];
  const scopedAdminModulesByOrganization =
    value.scopedAdminModulesByOrganization ??
    user.scopedAdminModulesByOrganization ??
    adminAccessPolicy?.scopedAdminModulesByOrganization ??
    fallback?.scopedAdminModulesByOrganization ??
    {};

  return {
    user: {
      ...fallbackUser,
      ...user,
      effectivePermissions,
      canAccessAdmin,
      adminAccessPolicy,
      adminScopes,
      visibleAdminModules,
      scopedAdminModulesByOrganization,
      organizationAssignments:
        user.organizationAssignments ?? fallbackUser?.organizationAssignments ?? [],
    } as AuthProfile['user'],
    permissions: effectivePermissions,
    canAccessAdmin,
    adminAccessPolicy,
    adminScopes,
    visibleAdminModules,
    scopedAdminModulesByOrganization,
  };
}

export function getDefaultAdminRoute(profile: AuthProfile | null): string {
  const defaultModule =
    profile?.adminAccessPolicy?.defaultAdminModule ??
    profile?.user.adminAccessPolicy?.defaultAdminModule;

  if (defaultModule && defaultModule in ADMIN_MODULE_ROUTES) {
    return ADMIN_MODULE_ROUTES[defaultModule as MobileAdminTabKey];
  }

  const tab = ADMIN_TAB_PRIORITY.find((candidate) => canUseAdminTab(profile, candidate));
  return ADMIN_MODULE_ROUTES[tab ?? 'settings'];
}
