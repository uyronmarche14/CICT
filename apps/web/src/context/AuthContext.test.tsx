import { describe, expect, it, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './AuthContext';
import { server } from '@/test/mocks/server';
import { http, HttpResponse } from 'msw';
import { type ReactNode } from 'react';

const API_URL = 'http://localhost:4000/api';

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  });
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <AuthProvider>{children}</AuthProvider>
      </QueryClientProvider>
    );
  };
}

describe('AuthContext', () => {
  beforeEach(() => {
    server.resetHandlers();
  });

  it('starts in loading state', () => {
    const { result } = renderHook(() => useAuth(), { wrapper: createWrapper() });

    expect(result.current.loading).toBe(true);
    expect(result.current.isAuthenticated).toBe(false);
  });

  it('loads profile on mount when not on login page', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.user).toBeDefined();
  });

  it('login sets user and permissions', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => {
      result.current.login({
        user: {
          _id: 'user-1',
          email: 'admin@example.com',
          firstName: 'Admin',
          lastName: 'User',
          role: 'admin',
          isActive: true,
          organizationAssignments: [],
          visibleAdminModules: ['dashboard'],
        },
        permissions: ['manage_all'],
        canAccessAdmin: true,
      });
    });

    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.user?.email).toBe('admin@example.com');
    expect(result.current.canAccessAdmin).toBe(true);
  });

  it('login accepts additive mobile token and student bridge fields', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => {
      result.current.login({
        accessToken: 'mobile-access-token',
        refreshToken: 'mobile-refresh-token',
        user: {
          id: 'user-1',
          email: 'admin@example.com',
          firstName: 'Admin',
          lastName: 'User',
          role: 'semi_admin',
          baseRoleLabel: 'Semi Admin',
          effectiveRoleLabel: 'Semi Admin',
          effectiveRoleKind: 'system',
          effectivePermissions: ['scan_event_attendance'],
          canAccessAdmin: true,
          organizationAssignments: [],
          visibleAdminModules: ['events'],
          scopedAdminModulesByOrganization: {},
          isActive: true,
          studentId: 'student-1',
        },
        permissions: ['scan_event_attendance'],
        canAccessAdmin: true,
        visibleAdminModules: ['events'],
      });
    });

    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.user?.email).toBe('admin@example.com');
    expect(result.current.user?.studentId).toBe('student-1');
    expect(result.current.permissions).toEqual(['scan_event_attendance']);
  });

  it('logout clears auth state', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => {
      result.current.login({
        user: {
          _id: 'user-1',
          email: 'admin@example.com',
          firstName: 'Admin',
          lastName: 'User',
          role: 'admin',
          isActive: true,
          organizationAssignments: [],
          visibleAdminModules: ['dashboard'],
        },
        permissions: ['manage_all'],
        canAccessAdmin: true,
      });
    });

    expect(result.current.isAuthenticated).toBe(true);

    await act(async () => {
      await result.current.logout();
    });

    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();
  });

  it('handles profile fetch failure gracefully', async () => {
    server.use(
      http.get(`${API_URL}/auth/profile`, () => {
        return HttpResponse.json({ success: false }, { status: 500 });
      })
    );

    const { result } = renderHook(() => useAuth(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });
});
