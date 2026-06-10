'use client';

import { Loader2, Users, CheckCircle2, Calendar, DollarSign, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useOrgDashboard } from '@/hooks/use-org-dashboard';

function MetricCard({
  icon: Icon,
  label,
  value,
  subtext,
  trend,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string | number;
  subtext?: string;
  trend?: 'up' | 'down' | 'neutral';
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

function getBudgetStatus(utilization: number): { label: string; color: string } {
  if (utilization > 0.9) return { label: 'Nearly Exhausted', color: 'text-red-500' };
  if (utilization > 0.7) return { label: 'Heavily Used', color: 'text-amber-500' };
  return { label: 'Healthy', color: 'text-green-500' };
}

export function OrganizationDashboard({ orgId }: { orgId: string }) {
  const { overview, tasks, events, financial, isLoading, error } = useOrgDashboard(orgId);

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

  const budgetStatus = financial ? getBudgetStatus(financial.budgetUtilization) : null;

  return (
    <div className="space-y-6">
      {/* Summary Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          icon={Users}
          label="Active Members"
          value={overview?.members ?? 0}
          subtext={`Engagement: ${overview ? formatPercent(overview.engagementScore / 100) : '—'}`}
        />
        <MetricCard
          icon={CheckCircle2}
          label="Tasks Completed"
          value={overview ? formatPercent(overview.tasksCompletionRate) : '—'}
          subtext={tasks ? `${tasks.overdueCount} overdue` : '—'}
          trend={overview && overview.tasksCompletionRate > 0.5 ? 'up' : 'down'}
        />
        <MetricCard
          icon={Calendar}
          label="Events Held"
          value={events?.totalEvents ?? 0}
          subtext={events ? `${events.totalAttendance} total attendance` : '—'}
        />
        <MetricCard
          icon={DollarSign}
          label="Budget Used"
          value={financial ? formatPercent(financial.budgetUtilization) : '—'}
          subtext={budgetStatus ? budgetStatus.label : '—'}
        />
      </div>

      {/* Task Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {tasks && tasks.byStatus.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Tasks by Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {tasks.byStatus.map((s) => (
                  <div key={s.name} className="flex items-center justify-between">
                    <span className="text-sm capitalize text-muted-foreground">{s.name.replace('_', ' ')}</span>
                    <span className="text-sm font-medium">{s.value}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {financial && financial.byCategory.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Budget by Category</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {financial.byCategory.map((c) => (
                  <div key={c.category} className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">{c.category}</span>
                    <span className="text-sm font-medium">
                      ₱{(c.expense || 0).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
