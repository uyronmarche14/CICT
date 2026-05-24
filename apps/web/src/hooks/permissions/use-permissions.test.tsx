import { describe, expect, it, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/context/AuthContext';
import { usePermissions } from './use-permissions';
import { Permission, ContentOwnerType } from '@/types';
import { type ReactNode } from 'react';

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  });
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </QueryClientProvider>
    );
  };
}

describe('usePermissions', () => {
  beforeEach(() => {});

  it('returns default permissions structure', () => {
    const { result } = renderHook(() => usePermissions(), { wrapper: createWrapper() });

    expect(result.current.permissions).toBeDefined();
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.isGuest).toBe(true);
    expect(result.current.hasAnyScopedAssignment).toBe(false);
  });

  it('hasPermission returns false for unauthenticated user', () => {
    const { result } = renderHook(() => usePermissions(), { wrapper: createWrapper() });

    expect(result.current.hasPermission(Permission.CREATE_NEWS)).toBe(false);
    expect(result.current.hasPermission(Permission.VIEW_USERS)).toBe(false);
  });

  it('provides module access helpers', () => {
    const { result } = renderHook(() => usePermissions(), { wrapper: createWrapper() });

    expect(result.current.canAccessNewsModule()).toBe(false);
    expect(result.current.canAccessEventsModule()).toBe(false);
    expect(result.current.canAccessOrganizationsModule()).toBe(false);
    expect(result.current.canAccessUsersModule()).toBe(false);
  });

  it('hasAnyPermission returns false with empty permissions', () => {
    const { result } = renderHook(() => usePermissions(), { wrapper: createWrapper() });

    expect(result.current.hasAnyPermission([Permission.CREATE_NEWS, Permission.EDIT_NEWS])).toBe(false);
  });

  it('hasAllPermissions returns false with empty permissions', () => {
    const { result } = renderHook(() => usePermissions(), { wrapper: createWrapper() });

    expect(result.current.hasAllPermissions([Permission.CREATE_NEWS, Permission.EDIT_NEWS])).toBe(false);
  });

  it('provides content management helpers', () => {
    const { result } = renderHook(() => usePermissions(), { wrapper: createWrapper() });

    expect(result.current.canPublishNews()).toBe(false);
    expect(result.current.canPublishEvent()).toBe(false);
    expect(result.current.canCreateAnnouncement()).toBe(false);
    expect(result.current.canPublishAnnouncement()).toBe(false);
  });

  it('provides user management helpers', () => {
    const { result } = renderHook(() => usePermissions(), { wrapper: createWrapper() });

    expect(result.current.canCreateUser()).toBe(false);
    expect(result.current.canReadUsers()).toBe(false);
    expect(result.current.canUpdateUser()).toBe(false);
    expect(result.current.canDeleteUser()).toBe(false);
  });

  it('provides role management helpers', () => {
    const { result } = renderHook(() => usePermissions(), { wrapper: createWrapper() });

    expect(result.current.canCreateRole()).toBe(false);
    expect(result.current.canReadRoles()).toBe(false);
    expect(result.current.canUpdateRole()).toBe(false);
    expect(result.current.canDeleteRole()).toBe(false);
  });

  it('canManageOrganizationContent checks ownerType', () => {
    const { result } = renderHook(() => usePermissions(), { wrapper: createWrapper() });

    expect(result.current.canManageOrganizationContent('org-1', Permission.EDIT_NEWS, ContentOwnerType.SYSTEM)).toBe(false);
    expect(result.current.canManageOrganizationContent('org-1', Permission.EDIT_NEWS, ContentOwnerType.ORGANIZATION)).toBe(false);
  });
});
