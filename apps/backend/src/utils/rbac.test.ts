import { describe, expect, it } from 'vitest';
import {
  hasGlobalPermission,
  hasAnyGlobalPermission,
  deriveAdminScopes,
  canAccessAdminPanel,
  getSystemRoleDefinition,
  getDefaultPermissions,
  deriveVisibleAdminModules,
  deriveAdminAccessPolicy,
} from './rbac';
import { Permission, UserRole } from '../types';

describe('hasGlobalPermission', () => {
  it('returns true when permission is in the list', () => {
    expect(hasGlobalPermission([Permission.VIEW_NEWS, Permission.EDIT_NEWS], Permission.VIEW_NEWS)).toBe(true);
  });

  it('returns false when permission is not in the list', () => {
    expect(hasGlobalPermission([Permission.VIEW_EVENT], Permission.VIEW_NEWS)).toBe(false);
  });

  it('works with user object format', () => {
    const user = { permissions: [Permission.VIEW_NEWS, Permission.PUBLISH_NEWS] };
    expect(hasGlobalPermission(user, Permission.VIEW_NEWS)).toBe(true);
    expect(hasGlobalPermission(user, Permission.DELETE_NEWS)).toBe(false);
  });
});

describe('hasAnyGlobalPermission', () => {
  it('returns true when any permission matches', () => {
    expect(hasAnyGlobalPermission([Permission.VIEW_USERS, Permission.CREATE_USER], [Permission.VIEW_USERS])).toBe(true);
    expect(hasAnyGlobalPermission([Permission.VIEW_USERS, Permission.CREATE_USER], [Permission.CREATE_USER, Permission.DELETE_USER])).toBe(true);
  });

  it('returns false when no permission matches', () => {
    expect(hasAnyGlobalPermission([Permission.VIEW_EVENT], [Permission.VIEW_NEWS, Permission.VIEW_ANNOUNCEMENT])).toBe(false);
  });

  it('returns false for empty list', () => {
    expect(hasAnyGlobalPermission([Permission.VIEW_NEWS], [])).toBe(false);
  });
});

describe('getSystemRoleDefinition', () => {
  it('returns full admin definition', () => {
    const def = getSystemRoleDefinition(UserRole.FULL_ADMIN);
    expect(def.systemRoleKey).toBe(UserRole.FULL_ADMIN);
    expect(def.name).toBe('Full Admin');
    expect(def.permissions).toHaveLength(Object.values(Permission).length);
  });

  it('returns semi admin definition', () => {
    const def = getSystemRoleDefinition(UserRole.SEMI_ADMIN);
    expect(def.systemRoleKey).toBe(UserRole.SEMI_ADMIN);
    expect(def.permissions.length).toBeGreaterThan(0);
    expect(def.permissions.length).toBeLessThan(Object.values(Permission).length);
  });

  it('returns support definition with empty permissions', () => {
    const def = getSystemRoleDefinition(UserRole.SUPPORT);
    expect(def.permissions).toEqual([]);
  });
});

describe('getDefaultPermissions', () => {
  it('returns all permissions for FULL_ADMIN', () => {
    const perms = getDefaultPermissions(UserRole.FULL_ADMIN);
    expect(perms).toContain(Permission.VIEW_NEWS);
    expect(perms).toContain(Permission.DELETE_USER);
  });

  it('returns empty array for SUPPORT', () => {
    expect(getDefaultPermissions(UserRole.SUPPORT)).toEqual([]);
  });
});

describe('deriveAdminScopes', () => {
  it('returns global: true when user has admin entry permissions', () => {
    const scopes = deriveAdminScopes([Permission.VIEW_USERS]);
    expect(scopes.global).toBe(true);
    expect(scopes.organizations).toEqual([]);
  });

  it('returns global: false when user lacks admin entry permissions', () => {
    const scopes = deriveAdminScopes([Permission.JOIN_EVENT]);
    expect(scopes.global).toBe(false);
  });

  it('includes organizations where user has admin entry permissions', () => {
    const assignments = [{ organizationId: 'org-1', permissions: [Permission.VIEW_USERS] }];
    const scopes = deriveAdminScopes([], assignments as any);
    expect(scopes.organizations).toEqual(['org-1']);
  });
});

describe('canAccessAdminPanel', () => {
  it('returns true with global admin permissions', () => {
    expect(canAccessAdminPanel([Permission.VIEW_USERS])).toBe(true);
  });

  it('returns true with scoped org access', () => {
    const assignments = [{ organizationId: 'org-1', permissions: [Permission.VIEW_NEWS] }];
    expect(canAccessAdminPanel([], assignments as any)).toBe(true);
  });

  it('returns false with no access', () => {
    expect(canAccessAdminPanel([Permission.JOIN_EVENT])).toBe(false);
  });
});

describe('deriveVisibleAdminModules', () => {
  it('includes dashboard when user has access', () => {
    const modules = deriveVisibleAdminModules([Permission.VIEW_USERS]);
    expect(modules).toContain('dashboard');
    expect(modules).toContain('users');
  });

  it('excludes modules user has no permission for', () => {
    const modules = deriveVisibleAdminModules([]);
    expect(modules).toEqual([]);
  });

  it('shows org-scoped modules from assignments', () => {
    const assignments = [{ organizationId: 'org-1', permissions: [Permission.VIEW_NEWS] }];
    const modules = deriveVisibleAdminModules([], assignments as any);
    expect(modules).toContain('dashboard');
    expect(modules).toContain('news');
  });
});

describe('deriveAdminAccessPolicy', () => {
  it('marks scanner-only admins as admin users with scanner as default module', () => {
    const policy = deriveAdminAccessPolicy([Permission.SCAN_EVENT_ATTENDANCE]);

    expect(policy.canAccessAdmin).toBe(true);
    expect(policy.visibleAdminModules).toContain('scanner');
    expect(policy.defaultAdminModule).toBe('scanner');
    expect(policy.globalActions).toEqual([Permission.SCAN_EVENT_ATTENDANCE]);
  });

  it('marks approval-only admins as admin users with approvals visible', () => {
    const policy = deriveAdminAccessPolicy([Permission.APPROVE_CONTENT]);

    expect(policy.canAccessAdmin).toBe(true);
    expect(policy.visibleAdminModules).toContain('approvals');
    expect(policy.defaultAdminModule).toBe('approvals');
  });

  it('keeps scoped organization actions and modules scoped to the organization', () => {
    const assignments = [
      { organizationId: 'org-1', permissions: [Permission.SCAN_EVENT_ATTENDANCE] },
    ];
    const policy = deriveAdminAccessPolicy([], assignments as any);

    expect(policy.canAccessAdmin).toBe(true);
    expect(policy.scopedAdminModulesByOrganization['org-1']).toContain('scanner');
    expect(policy.scopedActionsByOrganization['org-1']).toEqual([
      Permission.SCAN_EVENT_ATTENDANCE,
    ]);
  });
});
