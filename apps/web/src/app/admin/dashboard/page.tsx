'use client';

import { useAuth } from '@/context/AuthContext';
import { usePermissions } from '@/hooks/permissions/use-permissions';
import { adminAPI } from '@/lib/api/admin';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Newspaper, Megaphone, UserCog, Building2, CalendarDays, GraduationCap } from "lucide-react";
import { useQuery } from '@tanstack/react-query';
import type { AdminModuleKey } from '@/types';

export default function AdminDashboard() {
  const { loading: authLoading, isAuthenticated, canAccessAdmin } = useAuth();
  const { getVisibleAdminModules } = usePermissions();
  const canFetch = isAuthenticated && canAccessAdmin && !authLoading;

  const { data: summary, isPending } = useQuery({
    queryKey: ['admin', 'dashboard-summary'],
    queryFn: () => adminAPI.getDashboardSummary(),
    enabled: canFetch,
    staleTime: 30 * 1000,
  });

  const visibleModules = summary?.visibleModules ?? getVisibleAdminModules();

  if (authLoading || (isPending && canFetch)) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
          <p className="mt-4 text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !canAccessAdmin) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-muted-foreground">Access denied.</p>
      </div>
    );
  }

  const cards = [
    {
      key: 'users',
      title: 'Total Users',
      description: 'Registered users',
      value: summary?.cards?.users ?? 0,
      icon: <Users className="h-4 w-4 text-primary" />,
    },
    {
      key: 'students',
      title: 'Total Students',
      description: 'Registered students',
      value: summary?.cards?.students ?? 0,
      icon: <GraduationCap className="h-4 w-4 text-primary" />,
    },
    {
      key: 'news',
      title: 'News Articles',
      description: 'Total news',
      value: summary?.cards?.news ?? 0,
      icon: <Newspaper className="h-4 w-4 text-primary" />,
    },
    {
      key: 'announcements',
      title: 'Announcements',
      description: 'Total announcements',
      value: summary?.cards?.announcements ?? 0,
      icon: <Megaphone className="h-4 w-4 text-primary" />,
    },
    {
      key: 'roles',
      title: 'Roles',
      description: 'Total roles',
      value: summary?.cards?.roles ?? 0,
      icon: <UserCog className="h-4 w-4 text-primary" />,
    },
    {
      key: 'organizations',
      title: 'Organizations',
      description: 'Total organizations',
      value: summary?.cards?.organizations ?? 0,
      icon: <Building2 className="h-4 w-4 text-primary" />,
    },
    {
      key: 'events',
      title: 'Events',
      description: 'Total events',
      value: summary?.cards?.events ?? 0,
      icon: <CalendarDays className="h-4 w-4 text-primary" />,
    },
  ];

  const visibleCards = cards.filter(
    card => visibleModules.includes(card.key as AdminModuleKey)
  );

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-hairline bg-surface-elevated p-5 shadow-[var(--shadow-soft)] sm:p-6">
        <p className="text-xs font-semibold uppercase text-primary">CICT Admin</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Monitor content, students, events, organizations, and access across the portal.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {visibleCards.map((card) => (
          <Card key={card.key} className="overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {card.title}
              </CardTitle>
              <div className="rounded-lg border border-primary/10 bg-primary/10 p-2">
                {card.icon}
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
              <p className="text-xs text-muted-foreground">
                {card.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {visibleCards.length === 0 && (
        <div className="rounded-2xl border border-dashed border-hairline bg-surface-elevated text-center py-12">
          <p className="text-muted-foreground">No modules available.</p>
        </div>
      )}
    </div>
  );
}
