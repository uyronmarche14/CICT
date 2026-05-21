import { cleanup, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import AdminDashboard from './page';

const getDashboardSummary = vi.fn();

const authState = {
  user: {
    firstName: 'Casey',
  },
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
    getDashboardSummary: (...args: unknown[]) => getDashboardSummary(...args),
  },
}));

describe('AdminDashboard', () => {
  afterEach(() => {
    cleanup();
  });

  beforeEach(() => {
    authState.user = { firstName: 'Casey' };
    authState.loading = false;
    authState.isAuthenticated = true;
    authState.canAccessAdmin = true;
    getDashboardSummary.mockReset();
    getDashboardSummary.mockResolvedValue({
      cards: {
        users: 5,
        news: 3,
        announcements: 0,
        roles: 0,
        organizations: 0,
        events: 0,
      },
      visibleModules: ['users', 'news'],
    });
  });

  it('does not fetch dashboard summary while auth is still loading', () => {
    authState.loading = true;

    render(<AdminDashboard />);

    expect(getDashboardSummary).not.toHaveBeenCalled();
  });

  it('does not fetch dashboard summary for unauthenticated users', () => {
    authState.isAuthenticated = false;

    render(<AdminDashboard />);

    expect(getDashboardSummary).not.toHaveBeenCalled();
  });

  it('fetches dashboard summary only after admin auth is confirmed', async () => {
    render(<AdminDashboard />);

    await waitFor(() => {
      expect(getDashboardSummary).toHaveBeenCalledTimes(1);
    });

    expect(
      screen.getAllByText("Welcome back, Casey. Here's an overview of the system.").length
    ).toBeGreaterThan(0);
  });
});
