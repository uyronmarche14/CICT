import { Permission, UserRole } from '@cict/contracts/enums';

import type { AuthProfile } from '@/types/api';
import { getDefaultAdminRoute, normalizeAuthProfile } from '@/utils/auth-profile';

function makeProfile(overrides: Partial<AuthProfile> = {}): AuthProfile {
  const permissions = overrides.permissions ?? [];

  return {
    user: {
      id: 'user-1',
      email: 'admin@example.com',
      firstName: 'Ada',
      lastName: 'Lovelace',
      role: UserRole.SEMI_ADMIN,
      baseRoleLabel: 'Semi Admin',
      effectiveRoleLabel: 'Semi Admin',
      effectiveRoleKind: 'system',
      effectivePermissions: permissions,
      canAccessAdmin: true,
      adminAccessPolicy: {
        canAccessAdmin: true,
        visibleAdminModules: [],
        scopedAdminModulesByOrganization: {},
        globalActions: permissions,
        scopedActionsByOrganization: {},
        defaultAdminModule: 'settings',
      },
      visibleAdminModules: [],
      scopedAdminModulesByOrganization: {},
      organizationAssignments: [],
      isActive: true,
      ...overrides.user,
    },
    permissions,
    canAccessAdmin: true,
    adminAccessPolicy: {
      canAccessAdmin: true,
      visibleAdminModules: [],
      scopedAdminModulesByOrganization: {},
      globalActions: permissions,
      scopedActionsByOrganization: {},
      defaultAdminModule: 'settings',
    },
    visibleAdminModules: [],
    scopedAdminModulesByOrganization: {},
    ...overrides,
  } as AuthProfile;
}

describe('auth profile helpers', () => {
  it('normalizes additive admin response fields without removing web-safe profile data', () => {
    const profile = normalizeAuthProfile({
      accessToken: 'token',
      refreshToken: 'refresh',
      user: {
        id: 'user-1',
        email: 'admin@example.com',
        firstName: 'Ada',
        lastName: 'Lovelace',
        role: UserRole.SEMI_ADMIN,
        baseRoleLabel: 'Semi Admin',
        effectiveRoleLabel: 'Semi Admin',
        effectiveRoleKind: 'system',
        effectivePermissions: [Permission.VIEW_EVENT],
        canAccessAdmin: true,
        organizationAssignments: [],
        isActive: true,
        studentId: 'student-1',
      },
      canAccessAdmin: true,
    } as Partial<AuthProfile> & {
      accessToken: string;
      refreshToken: string;
    });

    expect(profile.user.email).toBe('admin@example.com');
    expect(profile.permissions).toEqual([Permission.VIEW_EVENT]);
    expect(profile.user.effectivePermissions).toEqual([Permission.VIEW_EVENT]);
    expect(profile.user.studentId).toBe('student-1');
  });

  it('routes scanner-only admins to scanner first', () => {
    const profile = makeProfile({
      permissions: [Permission.SCAN_EVENT_ATTENDANCE],
      adminAccessPolicy: {
        canAccessAdmin: true,
        visibleAdminModules: ['dashboard', 'scanner'],
        scopedAdminModulesByOrganization: {},
        globalActions: [Permission.SCAN_EVENT_ATTENDANCE],
        scopedActionsByOrganization: {},
        defaultAdminModule: 'scanner',
      },
    });

    expect(getDefaultAdminRoute(profile)).toBe('/(admin)/scanner');
  });

  it('routes event admins to events when scanner is not available', () => {
    const profile = makeProfile({
      permissions: [Permission.VIEW_EVENT],
      adminAccessPolicy: {
        canAccessAdmin: true,
        visibleAdminModules: ['dashboard', 'events'],
        scopedAdminModulesByOrganization: {},
        globalActions: [Permission.VIEW_EVENT],
        scopedActionsByOrganization: {},
        defaultAdminModule: 'events',
      },
    });

    expect(getDefaultAdminRoute(profile)).toBe('/(admin)/events');
  });

  it('falls back to settings when no admin module is available', () => {
    const profile = makeProfile({
      canAccessAdmin: false,
      permissions: [],
      user: makeProfile().user,
    });
    profile.user.canAccessAdmin = false;

    expect(getDefaultAdminRoute(profile)).toBe('/(admin)/settings');
    expect(getDefaultAdminRoute(null)).toBe('/(admin)/settings');
  });
});
