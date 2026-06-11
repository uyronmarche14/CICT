'use client';

import {
  Activity,
  AlertTriangle,
  Calendar,
  CheckCircle2,
  Clock,
  DollarSign,
  HardDrive,
  Inbox,
  Loader2,
  Users,
  Vote,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useOrgDashboard } from '@/hooks/use-org-dashboard';

function MetricCard({
  icon: Icon,
  label,
  value,
  subtext,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string | number;
  subtext?: string;
}) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">{label}</p>
            <p className="text-3xl font-bold">{value}</p>
            {subtext && <p className="text-xs text-muted-foreground">{subtext}</p>}
          </div>
          <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
            <Icon className="h-6 w-6 text-primary" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function formatPercent(value: number): string {
  return `${Math.round(value * 100)}%`;
}

function formatDate(value?: string): string {
  if (!value) {
    return 'No date';
  }

  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(value));
}

export function OrganizationDashboard({ orgId }: { orgId: string }) {
  const { dashboard, isLoading, error } = useOrgDashboard(orgId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-muted-foreground">
          <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-amber-500" />
          <p>Failed to load dashboard data.</p>
        </CardContent>
      </Card>
    );
  }

  const summary = dashboard?.summary;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          icon={Users}
          label="Active Members"
          value={summary?.activeMembers ?? 0}
          subtext={`${summary?.pendingApplications ?? 0} pending`}
        />
        <MetricCard
          icon={CheckCircle2}
          label="Open Tasks"
          value={summary?.tasksOpen ?? 0}
          subtext={`${summary?.tasksOverdue ?? 0} overdue`}
        />
        <MetricCard
          icon={Calendar}
          label="Upcoming"
          value={(summary?.upcomingMeetings ?? 0) + (summary?.upcomingEvents ?? 0)}
          subtext={`${summary?.upcomingMeetings ?? 0} meetings, ${summary?.upcomingEvents ?? 0} events`}
        />
        <MetricCard
          icon={Vote}
          label="Active Votes"
          value={summary?.activeVotes ?? 0}
          subtext={`${summary?.pendingResourceRequests ?? 0} resource requests`}
        />
        <MetricCard
          icon={DollarSign}
          label="Budget Used"
          value={summary ? formatPercent(summary.budgetUtilization) : '—'}
          subtext="Current fiscal snapshot"
        />
        <MetricCard
          icon={HardDrive}
          label="Storage Used"
          value={summary ? formatPercent(summary.storageUtilization) : '—'}
          subtext="Organization files"
        />
      </div>

      {dashboard?.alerts.length ? (
        <div className="grid gap-3 md:grid-cols-2">
          {dashboard.alerts.map((alert) => (
            <div
              key={`${alert.type}-${alert.label}`}
              className="flex items-center gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900"
            >
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <span>{alert.label}</span>
            </div>
          ))}
        </div>
      ) : null}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Inbox className="h-4 w-4" />
              Pending Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            {dashboard?.pendingActions.length ? (
              <div className="space-y-3">
                {dashboard.pendingActions.map((action) => (
                  <div key={`${action.type}-${action.id}`} className="flex items-start justify-between gap-4 rounded-lg border p-3">
                    <div>
                      <div className="text-sm font-medium">{action.label}</div>
                      <div className="mt-1 text-xs capitalize text-muted-foreground">
                        {action.type.replace(/_/g, ' ')}
                      </div>
                    </div>
                    <div className="whitespace-nowrap text-xs text-muted-foreground">
                      {formatDate(action.dueAt)}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No pending actions right now.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Clock className="h-4 w-4" />
              Upcoming Calendar
            </CardTitle>
          </CardHeader>
          <CardContent>
            {dashboard?.calendar.length ? (
              <div className="space-y-3">
                {dashboard.calendar.map((item) => (
                  <div key={`${item.type}-${item.id}`} className="flex items-start justify-between gap-4 rounded-lg border p-3">
                    <div>
                      <div className="text-sm font-medium">{item.title}</div>
                      <div className="mt-1 text-xs capitalize text-muted-foreground">
                        {item.type}
                      </div>
                    </div>
                    <div className="whitespace-nowrap text-xs text-muted-foreground">
                      {formatDate(item.date)}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No upcoming organization items.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Activity className="h-4 w-4" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          {dashboard?.recentActivity.length ? (
            <div className="divide-y">
              {dashboard.recentActivity.map((activity) => (
                <div key={activity._id ?? activity.id} className="flex items-center justify-between gap-4 py-3">
                  <div>
                    <div className="text-sm font-medium">
                      <span className="capitalize">{activity.action}</span>{' '}
                      <span className="text-muted-foreground">{activity.entityType.replace(/_/g, ' ')}</span>
                    </div>
                    <div className="mt-1 text-xs text-muted-foreground">
                      {activity.entityLabel || activity.actorName || activity.actorType}
                    </div>
                  </div>
                  <div className="whitespace-nowrap text-xs text-muted-foreground">
                    {formatDate(activity.createdAt)}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No activity has been recorded yet.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
