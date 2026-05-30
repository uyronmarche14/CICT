'use client';

import { useRouter, usePathname } from 'next/navigation';
import {
  ListChecks,
  CalendarClock,
  Vote,
  Wallet,
  BarChart3,
  LayoutTemplate,
  LayoutDashboard,
  MoreHorizontal,
  Handshake,
  MessageSquare,
  Share2,
  UsersRound,
  Package,
  GraduationCap,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { usePermissions } from '@/hooks/permissions/use-permissions';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

type PermissionHelpers = ReturnType<typeof usePermissions>;

interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  canAccess?: (permissions: PermissionHelpers, orgId: string) => boolean;
}

const ORG_TOOLS: NavItem[] = [
  { label: 'Overview', href: '', icon: LayoutDashboard },
  { label: 'Tasks', href: '/tasks', icon: ListChecks, canAccess: (permissions, orgId) => permissions.canManageOrgTasks(orgId) },
  { label: 'Meetings', href: '/meetings', icon: CalendarClock, canAccess: (permissions, orgId) => permissions.canManageOrgMeetings(orgId) },
  { label: 'Voting & Elections', href: '/voting', icon: Vote, canAccess: (permissions, orgId) => permissions.canManageOrgVotes(orgId) },
  { label: 'Budget & Finance', href: '/budget', icon: Wallet, canAccess: (permissions, orgId) => permissions.canManageOrgBudget(orgId) },
  { label: 'Analytics', href: '/analytics', icon: BarChart3 },
  { label: 'Partnerships', href: '/partnerships', icon: Handshake },
  { label: 'Collaboration Spaces', href: '/collaborations', icon: MessageSquare },
  { label: 'Shared Content', href: '/shared-content', icon: Share2 },
  { label: 'Task Forces', href: '/task-forces', icon: UsersRound },
  { label: 'Resource Pooling', href: '/resources', icon: Package },
  { label: 'Mentorship', href: '/mentorship', icon: GraduationCap },
  { label: 'Templates', href: '/templates', icon: LayoutTemplate, canAccess: (permissions) => permissions.hasAnyOrgTemplatesAccess() },
];

const MAX_VISIBLE = 7;

interface OrgSubNavProps {
  orgId: string;
  className?: string;
}

export default function OrgSubNav({ orgId, className }: OrgSubNavProps) {
  const pathname = usePathname();
  const router = useRouter();
  const permissions = usePermissions();

  const accessibleTools = ORG_TOOLS.filter(
    (item) => !item.canAccess || item.canAccess(permissions, orgId)
  );
  const visible = accessibleTools.slice(0, MAX_VISIBLE);
  const overflow = accessibleTools.slice(MAX_VISIBLE);

  const basePath = `/admin/organizations/${orgId}`;

  const isActive = (href: string) => {
    const full = `${basePath}${href}`;
    if (href === '') return pathname === full || pathname === `${basePath}/`;
    return pathname.startsWith(full);
  };

  return (
    <nav
      className={cn(
        'flex items-center gap-1 border-b border-border/60 overflow-x-auto no-scrollbar',
        className
      )}
    >
      {visible.map((item) => (
        <Button
          key={item.href}
          variant="ghost"
          size="sm"
          onClick={() => router.push(`${basePath}${item.href}`)}
          className={cn(
            'relative h-10 shrink-0 rounded-none border-b-2 border-transparent px-4 text-sm font-medium transition-colors',
            isActive(item.href)
              ? 'border-primary text-primary'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          <item.icon className="mr-2 h-4 w-4" />
          {item.label}
        </Button>
      ))}

      {overflow.length > 0 && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-10 rounded-none border-b-2 border-transparent px-3 text-muted-foreground hover:text-foreground"
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            {overflow.map((item) => (
              <DropdownMenuItem
                key={item.href}
                onClick={() => router.push(`${basePath}${item.href}`)}
                className={cn(
                  isActive(item.href) && 'bg-accent font-medium text-accent-foreground'
                )}
              >
                <item.icon className="mr-2 h-4 w-4" />
                {item.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </nav>
  );
}
