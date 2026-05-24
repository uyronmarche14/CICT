import { describe, expect, it, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StudentAuthProvider, useStudentAuth } from './StudentAuthContext';
import { server } from '@/test/mocks/server';
import { http, HttpResponse } from 'msw';
import { type ReactNode } from 'react';

const API_URL = 'http://localhost:5000/api';

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  });
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <StudentAuthProvider>{children}</StudentAuthProvider>
      </QueryClientProvider>
    );
  };
}

describe('StudentAuthContext', () => {
  beforeEach(() => {
    server.resetHandlers();
    localStorage.clear();
  });

  it('starts unauthenticated when no token', () => {
    const { result } = renderHook(() => useStudentAuth(), { wrapper: createWrapper() });

    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.student).toBeNull();
  });

  it('login sets student profile and tokens', async () => {
    server.use(
      http.post(`${API_URL}/student/auth/login`, () => {
        return HttpResponse.json({
          success: true,
          data: {
            accessToken: 'new-access-token',
            refreshToken: 'new-refresh-token',
            student: {
              _id: 'student-1',
              studentNumber: '2020-00001',
              firstName: 'Test',
              lastName: 'Student',
              email: 'test@example.com',
              programId: 'program-1',
              yearLevelId: 'year-1',
              sectionId: 'section-1',
              status: 'active',
              isActive: true,
              qrVersion: 1,
            },
          },
        });
      })
    );

    const { result } = renderHook(() => useStudentAuth(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.login('2020-00001', 'password123');
    });

    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.student?.firstName).toBe('Test');
  });

  it('logout clears student state', async () => {
    const { result } = renderHook(() => useStudentAuth(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.login('2020-00001', 'password123');
    });

    expect(result.current.isAuthenticated).toBe(true);

    await act(async () => {
      await result.current.logout();
    });

    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.student).toBeNull();
  });
});
