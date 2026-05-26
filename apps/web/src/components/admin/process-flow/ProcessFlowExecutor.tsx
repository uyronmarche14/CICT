'use client';

import { useCallback, useMemo, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { processAPI } from '@/lib/api/process';
import type { ProcessInstance, ProcessNode, ProcessEdge, NodeAssignment } from '@/lib/api/process';
import { ProcessFlowCanvas } from './ProcessFlowCanvas';
import { appToast } from '@/lib/app-toast';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Play, CheckCircle2, Archive, Loader2, Clock, History, MessageSquare, ThumbsUp } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';

interface ProcessFlowExecutorProps {
  instance: ProcessInstance;
  instanceId: string;
}

export function ProcessFlowExecutor({ instance, instanceId }: ProcessFlowExecutorProps) {
  const queryClient = useQueryClient();
  const [status, setStatus] = useState(instance.status);

  const refetch = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['process-instance', instanceId] });
    queryClient.invalidateQueries({ queryKey: ['process-instance-activity', instanceId] });
  }, [queryClient, instanceId]);

  const transitionMutation = useMutation({
    mutationFn: (toStatus: ProcessInstance['status']) => processAPI.transitionStatus(instanceId, toStatus),
    onSuccess: (data) => {
      setStatus(data.data.instance.status);
      refetch();
      appToast.success('Status updated');
    },
    onError: () => appToast.error('Failed to update status'),
  });

  const stepMutation = useMutation({
    mutationFn: ({ nodeId, action, reason }: { nodeId: string; action: 'approved' | 'rejected'; reason?: string }) =>
      processAPI.approveStep(instanceId, nodeId, action, reason),
    onSuccess: () => {
      refetch();
      appToast.success('Step updated');
    },
    onError: () => appToast.error('Failed to update step'),
  });

  const advanceMutation = useMutation({
    mutationFn: (completedNodeIds: string[]) => processAPI.advanceInstance(instanceId, completedNodeIds),
    onSuccess: () => {
      refetch();
      appToast.success('Task completed');
    },
    onError: () => appToast.error('Failed to advance'),
  });

  const checklistMutation = useMutation({
    mutationFn: ({ nodeId, itemId, completed }: { nodeId: string; itemId: string; completed: boolean }) =>
      processAPI.updateChecklistItem(instanceId, nodeId, itemId, completed),
    onSuccess: () => {
      refetch();
    },
    onError: () => appToast.error('Failed to update checklist'),
  });

  const handleToggleComplete = useCallback((nodeId: string) => {
    advanceMutation.mutate([nodeId]);
  }, [advanceMutation]);

  const handleChecklistToggle = useCallback((nodeId: string, itemId: string, completed: boolean) => {
    checklistMutation.mutate({ nodeId, itemId, completed });
  }, [checklistMutation]);

  const handleApprove = useCallback((nodeId: string) => {
    stepMutation.mutate({ nodeId, action: 'approved' });
  }, [stepMutation]);

  const handleReject = useCallback((nodeId: string) => {
    stepMutation.mutate({ nodeId, action: 'rejected' });
  }, [stepMutation]);

  const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'outline' | 'destructive'; icon: typeof Play }> = {
    draft: { label: 'Draft', variant: 'secondary', icon: Clock },
    active: { label: 'Active', variant: 'default', icon: Play },
    completed: { label: 'Completed', variant: 'outline', icon: CheckCircle2 },
    archived: { label: 'Archived', variant: 'destructive', icon: Archive },
  };

  const sc = statusConfig[status] || statusConfig.draft;
  const StatusIcon = sc.icon;

  const completedNodeIds = (instance.nodesSnapshot || [])
    .filter((n: ProcessNode) => n.data?.completed)
    .map((n: ProcessNode) => n.id);

  const approvalStepMap: Record<string, { status: string; actorId?: string; actedAt?: string }> = {};
  for (const step of instance.approvalSteps || []) {
    approvalStepMap[step.nodeId] = step;
  }

  const isCurrentNode = useCallback(
    (nodeId: string) => instance.currentNodeIds?.includes(nodeId) ?? false,
    [instance.currentNodeIds]
  );
  const isNodeCompleted = useCallback(
    (nodeId: string) =>
      completedNodeIds.includes(nodeId) ||
      approvalStepMap[nodeId]?.status === 'approved',
    [completedNodeIds, approvalStepMap]
  );

  const instanceMode = useMemo(() => ({
    isActive: isCurrentNode,
    isCompleted: isNodeCompleted,
    approvalStatus: (nodeId: string) => approvalStepMap[nodeId]?.status || null,
    currentNodeIds: instance.currentNodeIds || [],
    onToggleComplete: handleToggleComplete,
    onApprove: handleApprove,
    onReject: handleReject,
    onChecklistToggle: handleChecklistToggle,
  }), [isCurrentNode, isNodeCompleted, approvalStepMap, instance.currentNodeIds, handleToggleComplete, handleApprove, handleReject, handleChecklistToggle]);

  return (
    <div className="flex flex-col h-[calc(100vh-3rem)]">
      <div className="flex items-center justify-between shrink-0 pb-3">
        <div className="flex items-center gap-3 min-w-0">
          <Button variant="ghost" size="icon" asChild className="shrink-0">
            <Link href="/admin/processes/instances">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight truncate">{instance.title}</h1>
              <Badge variant={sc.variant} className="shrink-0 text-[10px] h-5">
                <StatusIcon className="mr-1 h-3 w-3" /> {sc.label}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground truncate">
              {instance.nodesSnapshot?.length || 0} nodes &middot; {instance.edgesSnapshot?.length || 0} edges
              {instance.startedAt && ` · Started ${format(new Date(instance.startedAt), 'MMM d, h:mm a')}`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {status === 'draft' && (
            <Button size="sm" className="h-8 text-xs" onClick={() => transitionMutation.mutate('active')} disabled={transitionMutation.isPending}>
              <Play className="mr-1 h-3 w-3" /> Activate
            </Button>
          )}
          {status === 'active' && (
            <Button size="sm" variant="outline" className="h-8 text-xs" onClick={() => transitionMutation.mutate('completed')} disabled={transitionMutation.isPending}>
              <CheckCircle2 className="mr-1 h-3 w-3" /> Complete
            </Button>
          )}
          {(status === 'active' || status === 'completed') && (
            <Button size="sm" variant="secondary" className="h-8 text-xs" onClick={() => transitionMutation.mutate('archived')} disabled={transitionMutation.isPending}>
              <Archive className="mr-1 h-3 w-3" /> Archive
            </Button>
          )}
        </div>
      </div>

      <div className="flex-1 min-h-0">
        <ProcessFlowCanvas
          key={instanceId}
          initialNodes={instance.nodesSnapshot || []}
          initialEdges={instance.edgesSnapshot || []}
          initialAssignments={instance.nodeAssignments || []}
          onChange={() => {}}
          instanceMode={instanceMode}
        />
      </div>
    </div>
  );
}
