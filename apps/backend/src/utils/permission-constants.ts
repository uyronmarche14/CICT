import { IAuthenticatedUser, Permission } from '../types';

const hasPermissionFromList = (
  permissions: Permission[],
  permission: Permission
): boolean => permissions.includes(permission);

export const hasGlobalPermission = (
  userOrPermissions: Pick<IAuthenticatedUser, 'permissions'> | Permission[],
  permission: Permission
): boolean =>
  hasPermissionFromList(
    Array.isArray(userOrPermissions) ? userOrPermissions : userOrPermissions.permissions,
    permission
  );

export const hasAnyGlobalPermission = (
  userOrPermissions: Pick<IAuthenticatedUser, 'permissions'> | Permission[],
  permissionsToCheck: Permission[]
): boolean =>
  permissionsToCheck.some((permission) => hasGlobalPermission(userOrPermissions, permission));
