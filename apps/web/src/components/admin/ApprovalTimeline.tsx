'use client';

import {
  SendHorizonal,
  CheckCircle2,
  XCircle,
  Globe,
  Archive,
  Ban,
  Undo2,
  Loader2,
  Clock,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import type { ApprovalActionItem } from '@/types';

interface ApprovalTimelineProps {
  actions?: ApprovalActionItem[];
  loading?: boolean;
  emptyMessage?: string;
}

const actionConfig: Record<string, { icon: typeof SendHorizonal; color: string; label: string }> = {
  submitted: { icon: SendHorizonal, color: 'text-blue-500 bg-blue-50 dark:bg-blue-950/30', label: 'Submitted' },
  approved: { icon: CheckCircle2, color: 'text-green-600 bg-green-50 dark:bg-green-950/30', label: 'Approved' },
  rejected: { icon: XCircle, color: 'text-red-600 bg-red-50 dark:bg-red-950/30', label: 'Rejected' },
  published: { icon: Globe, color: 'text-teal-600 bg-teal-50 dark:bg-teal-950/30', label: 'Published' },
  archived: { icon: Archive, color: 'text-gray-500 bg-gray-50 dark:bg-gray-800/30', label: 'Archived' },
  cancelled: { icon: Ban, color: 'text-orange-600 bg-orange-50 dark:bg-orange-950/30', label: 'Cancelled' },
  completed: { icon: CheckCircle2, color: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-950/30', label: 'Completed' },
  returned_to_draft: { icon: Undo2, color: 'text-amber-600 bg-amber-50 dark:bg-amber-950/30', label: 'Returned to Draft' },
};

export function ApprovalTimeline({
  actions,
  loading,
  emptyMessage = 'No approval actions recorded yet.',
}: ApprovalTimelineProps) {
  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!actions || actions.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 py-8 text-muted-foreground">
        <Clock className="w-8 h-8" />
        <p className="text-sm">{emptyMessage}</p>
      </div>
    );
  }

  const sortedActions = [...actions].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  return (
    <div className="space-y-0">
      {sortedActions.map((action, index) => {
        const config = actionConfig[action.action] ?? actionConfig.returned_to_draft;
        const Icon = config.icon;
        const isLast = index === sortedActions.length - 1;

        return (
          <div key={`${action.timestamp}-${action.action}-${index}`} className="flex gap-3">
            <div className="flex flex-col items-center">
              <div className={cn('p-1.5 rounded-full', config.color)}>
                <Icon className="w-3.5 h-3.5" />
              </div>
              {!isLast && <div className="w-px flex-1 bg-border min-h-[24px]" />}
            </div>
            <div className={cn('pb-4 flex-1', isLast && 'pb-0')}>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-medium">{action.actorDisplayName}</span>
                <span className="text-xs text-muted-foreground">{config.label}</span>
                <span className="text-xs text-muted-foreground">
                  {format(new Date(action.timestamp), 'MMM dd, h:mm a')}
                </span>
              </div>
              {action.action === 'rejected' && action.reason && (
                <p className="text-sm text-destructive mt-1">
                  Reason: {action.reason}
                </p>
              )}
              {action.comment && (
                <p className="text-sm text-muted-foreground mt-0.5">
                  {action.comment}
                </p>
              )}
              {action.fromStatus && action.toStatus && (
                <p className="text-xs text-muted-foreground mt-0.5">
                  {action.fromStatus.replace(/_/g, ' ')} → {action.toStatus.replace(/_/g, ' ')}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
