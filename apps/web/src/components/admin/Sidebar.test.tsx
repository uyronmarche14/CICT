import type { ReactNode } from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Permission, UserRole } from '@/types';
import { Sidebar } from './Sidebar';

vi.mock('next/navigation', () => ({
  usePathname: () => '/admin/news',
}));

vi.mock('next/link', () => ({
  default: ({ href, children }: { href: string; children: ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}));

vi.mock('@/context/AuthContext', () => ({
  useAuth: () => ({
    user: {
      id: 'user-1',
      email: 'admin@example.com',
      firstName: 'Casey',
      lastName: 'Admin',
      role: UserRole.SEMI_ADMIN,
      baseRoleLabel: 'Semi Admin',
      customRoleId: 'role-1',
      customRole: {
        id: 'role-1',
        name: 'Publishing Lead',
        description: 'Publishes content',
        permissions: [Permission.VIEW_NEWS, Permission.VIEW_EVENT],
      },
      effectiveRoleLabel: 'Publishing Lead',
      effectiveRoleKind: 'custom',
      effectivePermissions: [Permission.VIEW_NEWS, Permission.VIEW_EVENT],
      canAccessAdmin: true,
      isActive: true,
    },
    logout: vi.fn(),
  }),
}));

vi.mock('@/hooks/permissions/use-permissions', () => ({
  usePermissions: () => ({
    canAccessOrganizationsModule: () => false,
    canAccessUsersModule: () => false,
    canAccessStudentsModule: () => false,
    canAccessEventsModule: () => true,
    canAccessNewsModule: () => true,
    canAccessAnnouncementsModule: () => false,
    canAccessRolesModule: () => false,
    canAccessLogsModule: () => false,
    canAccessProcessesModule: () => false,
    canAccessApprovalsModule: () => false,
    canManageSettings: () => false,
  }),
}));

describe('Sidebar', () => {
  it('shows only routes allowed by backend-provided permissions', () => {
    render(<Sidebar />);

    expect(screen.getByText('Dashboard')).toBeTruthy();
    expect(screen.getByText('News')).toBeTruthy();
    expect(screen.getByText('Events')).toBeTruthy();
    expect(screen.getAllByText('Publishing Lead').length).toBeGreaterThan(0);

    expect(screen.queryByText('Users')).toBeNull();
    expect(screen.queryByText('Announcements')).toBeNull();
    expect(screen.queryByText('Roles & Permissions')).toBeNull();
  });
});
