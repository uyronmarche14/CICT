'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { BarChart3, Loader2, Users, CheckCircle2, CalendarClock, PiggyBank, Trophy } from 'lucide-react';
import { useAdminOrganization } from '@/hooks/useOrganizations';
import { usePermissions } from '@/hooks/permissions/use-permissions';
import { useAdminPageAccess } from '@/hooks/permissions/use-admin-page-access';
import { analyticsAPI } from '@/lib/api/org-analytics';
import { queryKeys } from '@/lib/query-keys';
import OrgPageLayout from '@/components/organizations/OrgPageLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, LineChart, Line } from 'recharts';

const COLORS = ['#6366f1', '#06b6d4', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6'];

function MetricCard({ icon: Icon, label, value, suffix, color }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string | number; suffix?: string; color?: string }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
        <Icon className={`h-4 w-4 ${color || 'text-muted-foreground'}`} />
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-bold">{value}{suffix}</p>
      </CardContent>
    </Card>
  );
}

export default function OrgAnalyticsPage() {
  const params = useParams();
  const orgId = params.id as string;
  const { canAccessOrganization } = usePermissions();
  const { shouldRender } = useAdminPageAccess(canAccessOrganization(orgId));
  const { loading: orgLoading } = useAdminOrganization(orgId);
  const canAnalytics = usePermissions().canManageOrgAnalytics(orgId);

  const { data: overview, isLoading: overviewLoading } = useQuery({
    queryKey: queryKeys.orgAnalytics.overview(orgId),
    queryFn: () => analyticsAPI.getOverview(orgId),
    enabled: !!orgId && canAnalytics,
  });

  const { data: tasks, isLoading: tasksLoading } = useQuery({
    queryKey: queryKeys.orgAnalytics.tasks(orgId),
    queryFn: () => analyticsAPI.getTasks(orgId),
    enabled: !!orgId && canAnalytics,
  });

  const { data: events, isLoading: eventsLoading } = useQuery({
    queryKey: queryKeys.orgAnalytics.events(orgId),
    queryFn: () => analyticsAPI.getEvents(orgId),
    enabled: !!orgId && canAnalytics,
  });

  const { data: financial, isLoading: financialLoading } = useQuery({
    queryKey: queryKeys.orgAnalytics.financial(orgId),
    queryFn: () => analyticsAPI.getFinancial(orgId),
    enabled: !!orgId && canAnalytics,
  });

  const { data: engagement, isLoading: engagementLoading } = useQuery({
    queryKey: queryKeys.orgAnalytics.engagement(orgId),
    queryFn: () => analyticsAPI.getEngagement(orgId),
    enabled: !!orgId && canAnalytics,
  });

  if (!shouldRender) return null;

  const isLoading = orgLoading || overviewLoading;

  return (
    <OrgPageLayout
      title="Analytics"
      icon={BarChart3}
      description="Organization performance metrics and insights."
      loading={orgLoading}
    >
      {isLoading ? (
        <div className="flex items-center justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
      ) : (
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="tasks">Tasks</TabsTrigger>
            <TabsTrigger value="events">Events</TabsTrigger>
            <TabsTrigger value="financial">Financial</TabsTrigger>
            <TabsTrigger value="engagement">Engagement</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <MetricCard icon={Users} label="Members" value={overview?.members ?? '—'} color="text-blue-500" />
              <MetricCard icon={CheckCircle2} label="Tasks Completed" value={overview?.tasksCompleted ?? '—'}
                suffix={overview?.tasksCompletionRate ? ` (${Math.round(overview.tasksCompletionRate * 100)}%)` : ''} color="text-green-500" />
              <MetricCard icon={CalendarClock} label="Meetings Held" value={overview?.meetingsHeld ?? '—'}
                suffix={overview?.meetingAttendanceRate ? ` (${Math.round(overview.meetingAttendanceRate * 100)}% avg)` : ''} color="text-purple-500" />
              <MetricCard icon={PiggyBank} label="Budget Used" value={overview?.budgetUtilization ? `${Math.round(overview.budgetUtilization * 100)}` : '—'} suffix="%" color="text-amber-500" />
            </div>

            {/* Engagement Score */}
            {overview?.engagementScore !== undefined && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-sm font-medium">
                    <Trophy className="h-4 w-4 text-amber-500" />
                    Engagement Score
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center gap-4">
                    <span className="text-3xl font-bold text-primary">{Math.round(overview.engagementScore)}</span>
                    <span className="text-sm text-muted-foreground">/ 100</span>
                  </div>
                  <Progress value={overview.engagementScore} className="h-2" />
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Tasks Tab */}
          <TabsContent value="tasks" className="space-y-6">
            {tasksLoading ? (
              <div className="flex items-center justify-center py-20"><Loader2 className="h-5 w-5 animate-spin text-primary" /></div>
            ) : tasks ? (
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                {/* Task Status Pie */}
                <Card>
                  <CardHeader><CardTitle className="text-sm font-medium">By Status</CardTitle></CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={250}>
                      <PieChart>
                        <Pie data={tasks.byStatus} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                          {tasks.byStatus.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
                {/* Task Priority Bar */}
                <Card>
                  <CardHeader><CardTitle className="text-sm font-medium">By Priority</CardTitle></CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart data={tasks.byPriority}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="value" fill="#6366f1" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            ) : <p className="text-sm text-muted-foreground">No task data available.</p>}
          </TabsContent>

          {/* Events Tab */}
          <TabsContent value="events" className="space-y-6">
            {eventsLoading ? (
              <div className="flex items-center justify-center py-20"><Loader2 className="h-5 w-5 animate-spin text-primary" /></div>
            ) : events ? (
              <>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <MetricCard icon={CalendarClock} label="Total Events" value={events.totalEvents} color="text-primary" />
                  <MetricCard icon={Users} label="Registrations" value={events.totalRegistrations} color="text-blue-500" />
                  <MetricCard icon={CheckCircle2} label="Attendance" value={events.totalAttendance}
                    suffix={events.attendanceRate ? ` (${Math.round(events.attendanceRate * 100)}%)` : ''} color="text-green-500" />
                </div>
                {/* Attendance Trend Line */}
                <Card>
                  <CardHeader><CardTitle className="text-sm font-medium">Monthly Trend</CardTitle></CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={events.byMonth}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="registrations" stroke="#6366f1" strokeWidth={2} />
                        <Line type="monotone" dataKey="attendance" stroke="#10b981" strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </>
            ) : <p className="text-sm text-muted-foreground">No event data available.</p>}
          </TabsContent>

          {/* Financial Tab */}
          <TabsContent value="financial" className="space-y-6">
            {financialLoading ? (
              <div className="flex items-center justify-center py-20"><Loader2 className="h-5 w-5 animate-spin text-primary" /></div>
            ) : financial ? (
              <>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
                  <MetricCard icon={PiggyBank} label="Income" value={`₱${(financial.totalIncome || 0).toLocaleString()}`} color="text-green-500" />
                  <MetricCard icon={PiggyBank} label="Expenses" value={`₱${(financial.totalExpenses || 0).toLocaleString()}`} color="text-red-500" />
                  <MetricCard icon={PiggyBank} label="Balance" value={`₱${(financial.balance || 0).toLocaleString()}`} color="text-primary" />
                  <MetricCard icon={PiggyBank} label="Budget Used" value={financial.budgetUtilization ? `${Math.round(financial.budgetUtilization * 100)}` : '0'} suffix="%" color="text-amber-500" />
                </div>
                {/* Budget Bar Chart */}
                {financial.byCategory && financial.byCategory.length > 0 && (
                  <Card>
                    <CardHeader><CardTitle className="text-sm font-medium">By Category</CardTitle></CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={financial.byCategory} layout="vertical">
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis type="number" />
                          <YAxis type="category" dataKey="category" width={120} />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="income" fill="#10b981" radius={[0, 4, 4, 0]} />
                          <Bar dataKey="expense" fill="#ef4444" radius={[0, 4, 4, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                )}
              </>
            ) : <p className="text-sm text-muted-foreground">No financial data available.</p>}
          </TabsContent>

          {/* Engagement Tab */}
          <TabsContent value="engagement" className="space-y-6">
            {engagementLoading ? (
              <div className="flex items-center justify-center py-20"><Loader2 className="h-5 w-5 animate-spin text-primary" /></div>
            ) : engagement ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-sm font-medium">
                      <Trophy className="h-4 w-4 text-amber-500" />
                      Score
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold text-primary">{Math.round(engagement.score)}</p>
                    <Progress value={engagement.score} className="mt-2 h-2" />
                  </CardContent>
                </Card>
                <MetricCard icon={Users} label="Active Members" value={engagement.activeMembers} color="text-blue-500" />
                <MetricCard icon={BarChart3} label="Total Hours" value={engagement.totalHours} color="text-purple-500" />
              </div>
            ) : <p className="text-sm text-muted-foreground">No engagement data available.</p>}
          </TabsContent>
        </Tabs>
      )}
    </OrgPageLayout>
  );
}
