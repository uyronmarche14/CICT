import { render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, type ReactNode } from 'react';
import AdminDashboard from './page';

const getDashboardSummary = vi.fn();

let authState: Record<string, unknown> = {
  user: { firstName: 'Casey' },
  loading: false,
  isAuthenticated: true,
  canAccessAdmin: true,
};

vi.mock('@/context/AuthContext', () => ({
  useAuth: () => authState,
}));

vi.mock('@/hooks/permissions/use-permissions', () => ({
  usePermissions: () => ({
    getVisibleAdminModules: () => ['users', 'news'],
  }),
}));

vi.mock('@/lib/api/admin', () => ({
  adminAPI: {
    getDashboardSummary: () => getDashboardSummary(),
  },
}));

function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
}

function Wrapper({ children }: { children: ReactNode }) {
  const [queryClient] = useState(createTestQueryClient);
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}

describe('AdminDashboard', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  beforeEach(() => {
    authState = {
      user: { firstName: 'Casey' },
      loading: false,
      isAuthenticated: true,
      canAccessAdmin: true,
    };
    getDashboardSummary.mockResolvedValue({
      cards: { users: 5, news: 3, announcements: 0, roles: 0, organizations: 0, events: 0 },
      visibleModules: ['users', 'news'],
    });
  });

  it('shows loading while auth is loading', () => {
    authState = { ...authState, loading: true };

    render(<AdminDashboard />, { wrapper: Wrapper });

    expect(screen.getByText('Loading dashboard...')).toBeTruthy();
  });

  it('shows access denied for unauthenticated users', () => {
    authState = { ...authState, isAuthenticated: false };

    render(<AdminDashboard />, { wrapper: Wrapper });

    expect(screen.getByText('Access denied.')).toBeTruthy();
  });

  it('fetches dashboard summary', async () => {
    render(<AdminDashboard />, { wrapper: Wrapper });

    await vi.waitFor(() => {
      expect(getDashboardSummary).toHaveBeenCalled();
    }, { timeout: 5000 });
  });
});
