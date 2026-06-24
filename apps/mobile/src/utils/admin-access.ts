import type { AdminModuleKey } from '@cict/contracts/types';
import type { AuthProfile } from '@/types/api';

export type MobileAdminTabKey =
  | 'dashboard'
  | 'scanner'
  | 'events'
  | 'approvals'
  | 'students'
  | 'organizations'
  | 'settings';

const MODULE_BY_TAB: Record<MobileAdminTabKey, AdminModuleKey> = {
  dashboard: 'dashboard',
  scanner: 'scanner',
  events: 'events',
  approvals: 'approvals',
  students: 'students',
  organizations: 'organizations',
  settings: 'settings',
};

export function canUseAdminTab(
  profile: AuthProfile | null,
  tab: MobileAdminTabKey
): boolean {
  if (!profile) {
    return false;
  }

  if (tab === 'settings') {
    return true;
  }

  const policy = profile.adminAccessPolicy ?? profile.user.adminAccessPolicy;
  const visibleModules =
    policy?.visibleAdminModules ?? profile.visibleAdminModules ?? profile.user.visibleAdminModules ?? [];
  const scopedModules = Object.values(
    policy?.scopedAdminModulesByOrganization ??
      profile.scopedAdminModulesByOrganization ??
      profile.user.scopedAdminModulesByOrganization ??
      {}
  ).flat();
  const module = MODULE_BY_TAB[tab];

  if (
    tab === 'dashboard' &&
    (profile.canAccessAdmin || visibleModules.length > 0 || scopedModules.length > 0)
  ) {
    return true;
  }

  if (tab === 'dashboard') {
    return false;
  }

  return visibleModules.includes(module) || scopedModules.includes(module);
}
