'use client';

import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface OrgPageLayoutProps {
  title: string;
  icon?: LucideIcon;
  description?: string;
  children: ReactNode;
  loading?: boolean;
  empty?: boolean;
  emptyMessage?: string;
  action?: ReactNode;
}

export default function OrgPageLayout({
  title,
  icon: Icon,
  description,
  children,
  loading,
  empty,
  emptyMessage = 'No data available yet.',
  action,
}: OrgPageLayoutProps) {
  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Skeleton className="h-32 rounded-xl" />
          <Skeleton className="h-32 rounded-xl" />
          <Skeleton className="h-32 rounded-xl" />
        </div>
      </div>
    );
  }

  if (empty) {
    return (
      <div className="flex min-h-[300px] flex-col items-center justify-center rounded-xl border border-dashed border-border/60 p-12 text-center">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
          {Icon && <Icon className="h-6 w-6 text-muted-foreground" />}
        </div>
        <h3 className="mb-1 text-lg font-semibold">{title}</h3>
        <p className="max-w-sm text-sm text-muted-foreground">{emptyMessage}</p>
        {action && <div className="mt-6">{action}</div>}
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            {Icon && (
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                <Icon className="h-4 w-4 text-primary" />
              </div>
            )}
            <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
          </div>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </div>
        {action && <div className="flex items-center gap-2">{action}</div>}
      </div>
      {children}
    </div>
  );
}
