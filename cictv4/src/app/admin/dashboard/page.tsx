'use client';

import axios from 'axios';
import { useAuth } from '@/context/AuthContext';
import { usePermissions } from '@/hooks/permissions/use-permissions';
import { adminAPI } from '@/lib/api/admin';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Newspaper, Megaphone, UserCog, Building2, CalendarDays, GraduationCap } from "lucide-react";
import { useEffect, useState } from 'react';
import { AdminModuleKey, DashboardSummary } from '@/types';

export default function AdminDashboard() {
  const { user, loading: authLoading, isAuthenticated, canAccessAdmin } = useAuth();
  const { getVisibleAdminModules } = usePermissions();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) {
      setLoading(true);
      return;
    }

    if (!isAuthenticated || !canAccessAdmin) {
      setLoading(false);
      setSummary(null);
      return;
    }

    const controller = new AbortController();
    let isActive = true;

    const fetchSummary = async () => {
      try {
        const response = await adminAPI.getDashboardSummary(controller.signal);
        if (isActive) {
          setSummary(response);
        }
      } catch (error) {
        if (!isActive || axios.isCancel(error)) {
          return;
        }

        if (axios.isAxiosError(error) && [401, 403].includes(error.response?.status ?? 0)) {
          return;
        }

        console.error('Failed to fetch dashboard summary:', error);
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    };

    fetchSummary();

    return () => {
      isActive = false;
      controller.abort();
    };
  }, [authLoading, canAccessAdmin, isAuthenticated]);

  const visibleModules = summary?.visibleModules ?? getVisibleAdminModules();

  const cards = [
    {
      key: 'users',
      title: 'Total Users',
      description: 'Registered users',
      icon: Users,
      value: summary?.cards.users ?? 0,
    },
    {
      key: 'news',
      title: 'News Articles',
      description: 'News records',
      icon: Newspaper,
      value: summary?.cards.news ?? 0,
    },
    {
      key: 'students',
      title: 'Students',
      description: 'Student records',
      icon: GraduationCap,
      value: summary?.cards.students ?? 0,
    },
    {
      key: 'announcements',
      title: 'Announcements',
      description: 'Announcement records',
      icon: Megaphone,
      value: summary?.cards.announcements ?? 0,
    },
    {
      key: 'roles',
      title: 'Roles',
      description: 'Defined roles',
      icon: UserCog,
      value: summary?.cards.roles ?? 0,
    },
    {
      key: 'organizations',
      title: 'Organizations',
      description: 'Managed organizations',
      icon: Building2,
      value: summary?.cards.organizations ?? 0,
    },
    {
      key: 'events',
      title: 'Events',
      description: 'Event records',
      icon: CalendarDays,
      value: summary?.cards.events ?? 0,
    },
  ].filter((card) => visibleModules.includes(card.key as AdminModuleKey));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back, {user?.firstName}. Here&apos;s an overview of the system.
        </p>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.key}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{loading ? '...' : card.value}</div>
                <p className="text-xs text-muted-foreground">{card.description}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
