'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { usePermissions } from '@/hooks/permissions/use-permissions';
import { useAdminOrganizations } from '@/hooks/useOrganizations';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  Newspaper,
  Megaphone,
  HelpCircle,
  LogOut,
  UserCog,
  Menu,
  Calendar,
  CalendarDays,
  Building2,
  ScrollText,
  Workflow,
  ClipboardCheck,
  Settings,
  ChevronDown,
  ChevronRight,
  ListChecks,
  CalendarClock,
  Vote,
  Wallet,
  BarChart3,
  LayoutTemplate,
  Handshake,
  MessageSquare,
  Share2,
  UsersRound,
  Package,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  Sidebar as SidebarPrimitive,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import type { Organization } from '@/types';

// ——— Constants ———

type PermissionHelpers = ReturnType<typeof usePermissions>;

type OrgTool = {
  label: string;
  icon: LucideIcon;
  href: string;
  canAccess?: (permissions: PermissionHelpers, orgId: string) => boolean;
};

const PHASE_10_ORG_TOOLS: OrgTool[] = [
  { label: 'Overview', icon: LayoutDashboard, href: '' },
  { label: 'Calendar', icon: CalendarDays, href: '/calendar' },
  { label: 'Tasks', icon: ListChecks, href: '/tasks', canAccess: (permissions, orgId) => permissions.canManageOrgTasks(orgId) },
  { label: 'Meetings', icon: CalendarClock, href: '/meetings', canAccess: (permissions, orgId) => permissions.canManageOrgMeetings(orgId) },
  { label: 'Voting & Elections', icon: Vote, href: '/voting', canAccess: (permissions, orgId) => permissions.canManageOrgVotes(orgId) },
  { label: 'Budget & Finance', icon: Wallet, href: '/budget', canAccess: (permissions, orgId) => permissions.canManageOrgBudget(orgId) },
  { label: 'Analytics', icon: BarChart3, href: '/analytics', canAccess: (permissions, orgId) => permissions.canManageOrgAnalytics(orgId) },
  { label: 'Partnerships', icon: Handshake, href: '/partnerships', canAccess: (permissions, orgId) => permissions.canManageOrgPartnerships(orgId) },
  { label: 'Collaboration Spaces', icon: MessageSquare, href: '/collaborations', canAccess: (permissions, orgId) => permissions.canManageOrgCollaborations(orgId) },
  { label: 'Shared Content', icon: Share2, href: '/shared-content', canAccess: (permissions, orgId) => permissions.canManageOrgSharedContent(orgId) },
  { label: 'Task Forces', icon: UsersRound, href: '/task-forces', canAccess: (permissions, orgId) => permissions.canManageOrgTaskForces(orgId) },
  { label: 'Resource Pooling', icon: Package, href: '/resources', canAccess: (permissions, orgId) => permissions.canManageOrgResources(orgId) },
  { label: 'Mentorship', icon: GraduationCap, href: '/mentorship', canAccess: (permissions, orgId) => permissions.canManageOrgMentorship(orgId) },
  { label: 'Templates', icon: LayoutTemplate, href: '/templates', canAccess: (permissions) => permissions.hasAnyOrgTemplatesAccess() },
];

type SidebarRoute = {
  href: string;
  label: string;
  icon: LucideIcon;
  active: boolean;
  visible: boolean;
};

// ——— Helpers ———

const getCurrentOrgId = (pathname: string): string | null => {
  const match = pathname.match(/^\/admin\/organizations\/([^/]+)/);
  return match ? match[1] : null;
};

const getCurrentTool = (pathname: string): string => {
  const match = pathname.match(/^\/admin\/organizations\/[^/]+(\/.*)?$/);
  return match ? (match[1] || '') : '';
};

// ——— Top-level nav routes ———

const buildTopRoutes = (
  pathname: string,
  permissions: ReturnType<typeof usePermissions>
): SidebarRoute[] => [
  { href: '/admin/users', label: 'Users', icon: Users, active: pathname.startsWith('/admin/users'), visible: permissions.canAccessUsersModule() },
  { href: '/admin/students', label: 'Students', icon: GraduationCap, active: pathname.startsWith('/admin/students'), visible: permissions.canAccessStudentsModule() },
  { href: '/admin/events', label: 'Events', icon: Calendar, active: pathname.startsWith('/admin/events'), visible: permissions.canAccessEventsModule() },
  { href: '/admin/calendar', label: 'Calendar', icon: CalendarDays, active: pathname.startsWith('/admin/calendar'), visible: true },
  { href: '/admin/approvals', label: 'Approvals', icon: ClipboardCheck, active: pathname.startsWith('/admin/approvals'), visible: permissions.canAccessApprovalsModule() },
  { href: '/admin/news', label: 'News', icon: Newspaper, active: pathname.startsWith('/admin/news'), visible: permissions.canAccessNewsModule() },
  { href: '/admin/announcements', label: 'Announcements', icon: Megaphone, active: pathname.startsWith('/admin/announcements'), visible: permissions.canAccessAnnouncementsModule() },
  { href: '/admin/inquiries', label: 'Messages', icon: MessageSquare, active: pathname.startsWith('/admin/inquiries'), visible: permissions.canAccessAdmin },
  { href: '/admin/roles', label: 'Roles & Permissions', icon: UserCog, active: pathname.startsWith('/admin/roles'), visible: permissions.canAccessRolesModule() },
  { href: '/admin/logs', label: 'Activity Logs', icon: ScrollText, active: pathname.startsWith('/admin/logs'), visible: permissions.canAccessLogsModule() },
  { href: '/admin/processes', label: 'Process', icon: Workflow, active: pathname.startsWith('/admin/processes'), visible: permissions.canAccessProcessesModule() },
  { href: '/admin/settings', label: 'Settings', icon: Settings, active: pathname.startsWith('/admin/settings'), visible: permissions.canManageSettings() },
  { href: '/admin/faq', label: 'FAQ', icon: HelpCircle, active: pathname.startsWith('/admin/faq'), visible: permissions.canManageSettings() },
];

// ——— Sub-components ———

function OrgTreeNode({
  org,
  activeOrgId,
  currentTool,
  defaultOpen,
  permissions,
}: {
  org: Organization;
  activeOrgId: string | null;
  currentTool: string;
  defaultOpen: boolean;
  permissions: PermissionHelpers;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const isActiveOrg = org.id === activeOrgId;

  return (
    <Collapsible asChild open={open} onOpenChange={setOpen}>
      <SidebarMenuItem>
        <div className={cn('flex items-center group-data-[collapsible=icon]:justify-center', isActiveOrg && !currentTool && 'rounded-md bg-sidebar-primary/10')}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="icon" className={cn('h-8 w-8 shrink-0 rounded-md', 'group-data-[collapsible=icon]:hidden')}>
              <ChevronRight className={cn('h-3.5 w-3.5 transition-transform duration-200', open && 'rotate-90')} />
            </Button>
          </CollapsibleTrigger>
          <Button variant="ghost" className="flex h-8 flex-1 items-center gap-2 justify-start rounded-md px-1 text-sm font-normal group-data-[collapsible=icon]:hidden" asChild>
            <Link href={`/admin/organizations/${org.id}`}>
              <Avatar className="h-5 w-5 rounded-sm text-[8px] font-bold">
                {org.logo ? <AvatarImage src={org.logo} alt={org.name} className="object-contain" /> : null}
                <AvatarFallback className="rounded-sm text-[8px] font-bold text-white" style={{ backgroundColor: org.color?.primary || '#6366f1' }}>
                  {org.name?.slice(0, 2).toUpperCase() || 'OR'}
                </AvatarFallback>
              </Avatar>
              <span className="truncate">{org.fullName || org.name}</span>
            </Link>
          </Button>
        </div>
        <CollapsibleContent>
          <SidebarMenuSub>
            {PHASE_10_ORG_TOOLS.filter(
              (tool) => tool.href !== '' && (!tool.canAccess || tool.canAccess(permissions, org.id))
            ).map((tool) => {
              const fullHref = `/admin/organizations/${org.id}${tool.href}`;
              const isActive = isActiveOrg && currentTool === tool.href;
              return (
                <SidebarMenuSubItem key={tool.href}>
                  <SidebarMenuSubButton isActive={isActive} asChild>
                    <Link href={fullHref}>
                      <tool.icon className={cn('h-3.5 w-3.5', isActive && 'text-primary')} />
                      <span>{tool.label}</span>
                    </Link>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
              );
            })}
          </SidebarMenuSub>
        </CollapsibleContent>
      </SidebarMenuItem>
    </Collapsible>
  );
}

function OrganizationsTree({
  orgs,
  loading,
  activeOrgId,
  currentTool,
  permissions,
}: {
  orgs: Organization[];
  loading: boolean;
  activeOrgId: string | null;
  currentTool: string;
  permissions: PermissionHelpers;
}) {
  const [orgSectionOpen, setOrgSectionOpen] = useState(true);

  if (loading) {
    return (
      <div className="px-3 py-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-center gap-2 py-1.5">
            <div className="h-4 w-4 animate-pulse rounded bg-muted-foreground/20" />
            <div className="h-5 w-5 animate-pulse rounded-sm bg-muted-foreground/20" />
            <div className="h-3 flex-1 animate-pulse rounded bg-muted-foreground/20" />
          </div>
        ))}
      </div>
    );
  }

  const activeOrgs = orgs.filter((o) => o.isActive !== false);

  return (
    <SidebarGroup>
      <Collapsible open={orgSectionOpen} onOpenChange={setOrgSectionOpen}>
        <CollapsibleTrigger asChild>
          <SidebarGroupLabel className="flex cursor-pointer select-none items-center gap-2 px-2">
            <ChevronDown
              className={cn(
                'h-3 w-3 shrink-0 transition-transform duration-200',
                orgSectionOpen && 'rotate-0',
                !orgSectionOpen && '-rotate-90'
              )}
            />
            <Building2 className="h-4 w-4" />
            <span className="flex-1">Organizations</span>
            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-sidebar-accent px-1.5 text-[10px] font-medium text-sidebar-accent-foreground">
              {activeOrgs.length}
            </span>
          </SidebarGroupLabel>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <SidebarMenu className="mt-1">
            {activeOrgs.map((org) => (
              <OrgTreeNode
                key={org.id}
                org={org}
                activeOrgId={activeOrgId}
                currentTool={currentTool}
                defaultOpen={org.id === activeOrgId}
                permissions={permissions}
              />
            ))}
          </SidebarMenu>
        </CollapsibleContent>
      </Collapsible>
    </SidebarGroup>
  );
}

// ——— Main Content ———

function SidebarContentInner({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const permissions = usePermissions();
  const { organizations: orgs, loading: orgsLoading } = useAdminOrganizations();

  const activeOrgId = getCurrentOrgId(pathname);
  const currentTool = getCurrentTool(pathname);

  const topRoutes = useMemo(
    () => buildTopRoutes(pathname, permissions).filter((r) => r.visible),
    [pathname, permissions]
  );

  const showOrgs = permissions.canAccessOrganizationsModule();

  return (
    <>
      {/* Brand header */}
      <SidebarHeader className="flex-row items-center border-b border-sidebar-border px-2 py-2">
        {/* Collapsed state: clickable logo badge */}
        <SidebarTrigger className="hidden items-center justify-center group-data-[collapsible=icon]:flex">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-[10px] font-bold text-primary-foreground">
            CI
          </div>
        </SidebarTrigger>
        {/* Expanded state: brand text + collapse button */}
        <div className="flex w-full items-center justify-between group-data-[collapsible=icon]:hidden">
          <span className="text-base font-semibold tracking-tight">CICT Admin</span>
          <SidebarTrigger />
        </div>
      </SidebarHeader>

      {/* Scrollable nav — hidden scrollbar */}
      <SidebarContent className="no-scrollbar">
        {/* Dashboard */}
        <SidebarGroup>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                tooltip="Dashboard"
                isActive={pathname === '/admin/dashboard'}
                asChild
              >
                <Link href="/admin/dashboard">
                  <LayoutDashboard />
                  <span>Dashboard</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>

        {/* Organizations tree — with collapsible section header */}
        {showOrgs && (
          <OrganizationsTree
            orgs={orgs}
            loading={orgsLoading}
            activeOrgId={activeOrgId}
            currentTool={currentTool}
            permissions={permissions}
          />
        )}

        {/* Other modules */}
        {topRoutes.length > 0 && (
          <SidebarGroup>
            <SidebarMenu>
              {topRoutes.map((route) => (
                <SidebarMenuItem key={route.href}>
                  <SidebarMenuButton
                    tooltip={route.label}
                    isActive={route.active}
                    asChild
                  >
                    <Link href={route.href}>
                      <route.icon />
                      <span>{route.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroup>
        )}
      </SidebarContent>

      {/* User footer */}
      <SidebarFooter className="border-t border-sidebar-border p-2">
        <div className="mb-1 flex items-center gap-2 overflow-hidden px-1 group-data-[collapsible=icon]:hidden">
          <Avatar className="h-7 w-7 shrink-0">
            <AvatarImage
              src={`https://ui-avatars.com/api/?name=${user?.firstName}+${user?.lastName}`}
              alt="@admin"
            />
            <AvatarFallback className="text-xs">
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </AvatarFallback>
          </Avatar>
          <div className="flex min-w-0 flex-1 flex-col">
            <span className="truncate text-xs font-medium">
              {user?.firstName} {user?.lastName}
            </span>
            <span className="truncate text-[10px] text-muted-foreground">
              {user?.effectiveRoleLabel ?? user?.role}
            </span>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start text-muted-foreground hover:text-red-500 hover:bg-red-50 group-data-[collapsible=icon]:w-full group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0 dark:hover:bg-red-950/20"
          onClick={() => {
            logout();
            onNavigate?.();
          }}
        >
          <LogOut className="mr-2 h-3.5 w-3.5 shrink-0 group-data-[collapsible=icon]:mr-0" />
          <span className="group-data-[collapsible=icon]:hidden">Logout</span>
        </Button>
      </SidebarFooter>
    </>
  );
}

// ——— Exports ———

export function Sidebar({ className }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <SidebarPrimitive collapsible="icon" className={className}>
      <SidebarContentInner />
      <SidebarRail />
    </SidebarPrimitive>
  );
}

export function MobileSidebar() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button
            variant="default"
            size="icon"
            className="fixed bottom-4 left-4 z-50 h-10 w-10 rounded-full shadow-lg md:hidden"
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle Menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-72 p-0">
          <SidebarContentInner onNavigate={() => setOpen(false)} />
        </SheetContent>
      </Sheet>
    </>
  );
}
