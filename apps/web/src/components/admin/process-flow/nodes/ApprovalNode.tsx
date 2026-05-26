'use client';

import { useCallback, useState } from 'react';
import { Handle, Position, NodeToolbar, type NodeProps } from '@xyflow/react';
import { ThumbsUp, ThumbsDown, Calendar, MessageSquareText, CheckCircle2, XCircle, Clock, Loader2 } from 'lucide-react';

export function ApprovalNode({ id, data, selected }: NodeProps) {
  const [actionLoading, setActionLoading] = useState<'approve' | 'reject' | null>(null);
  const assignees = data.assignees as Array<{ type: string; id: string; name?: string }> | undefined;
  const approvalType = String(data.approvalType || 'all');
  const dueDate = String(data.dueDate || '');
  const rejectionBehavior = String(data.rejectionBehavior || 'revise');
  const instanceMode = !!data._instanceMode;
  const instanceStatus = data._instanceApprovalStatus as string | null;
  const status = instanceMode
    ? (instanceStatus || 'pending')
    : (String(data.status || 'pending'));
  const isActive = instanceMode ? !!data._instanceActive : true;
  const approvedBy = (data.approvedBy as string[]) || [];
  const rejectedBy = (data.rejectedBy as string[]) || [];
  const minApprovers = (data.minApprovers as number) || 1;

  const onApprove = data.onApprove as ((id: string) => void) | undefined;
  const onReject = data.onReject as ((id: string) => void) | undefined;
  const onChecklistToggle = data.onChecklistToggle as ((nodeId: string, itemId: string, completed: boolean) => void) | undefined;
  const checklist = (data.checklist as Array<{ id: string; label: string; completed?: boolean }>) || [];

  const handleApprove = useCallback(() => {
    if (actionLoading) return;
    setActionLoading('approve');
    onApprove?.(id);
    setTimeout(() => setActionLoading(null), 2000);
  }, [onApprove, id, actionLoading]);

  const handleReject = useCallback(() => {
    if (actionLoading) return;
    setActionLoading('reject');
    onReject?.(id);
    setTimeout(() => setActionLoading(null), 2000);
  }, [onReject, id, actionLoading]);

  const borderColor = status === 'approved' ? 'border-green-400'
    : status === 'rejected' ? 'border-red-400'
    : selected ? 'border-amber-500' : 'border-amber-300';

  const bgColor = status === 'approved' ? 'bg-green-50'
    : status === 'rejected' ? 'bg-red-50'
    : 'bg-white';

  const ringColor = selected ? 'ring-2 ring-amber-200' : '';

  const totalNeeded = approvalType === 'any' ? 1 : minApprovers;
  const approvedCount = approvedBy.length;
  const progress = Math.min(approvedCount / totalNeeded, 1);

  return (
    <div className={`px-4 py-3 rounded-lg border-2 ${bgColor} shadow-md min-w-[200px] transition-all duration-200 ${borderColor} ${ringColor} hover:shadow-lg`}>
      <Handle type="target" position={Position.Top} className="!bg-amber-400" />
      <Handle type="source" position={Position.Bottom} className="!bg-amber-400" />
      <NodeToolbar isVisible={selected && status === 'pending' && isActive} position={Position.Top}>
        <div className="flex gap-1 bg-background border rounded-lg p-1 shadow-md">
          <button
            onClick={handleApprove}
            disabled={!!actionLoading}
            className={`flex items-center gap-1 px-2 py-1 text-[10px] font-medium rounded transition-colors ${
              actionLoading === 'approve' ? 'opacity-50 cursor-not-allowed' : 'text-green-700 hover:bg-green-50'
            }`}
          >
            {actionLoading === 'approve' ? <Loader2 className="h-3 w-3 animate-spin" /> : <ThumbsUp className="h-3 w-3" />}
            {actionLoading === 'approve' ? 'Saving...' : 'Approve'}
          </button>
          <button
            onClick={handleReject}
            disabled={!!actionLoading}
            className={`flex items-center gap-1 px-2 py-1 text-[10px] font-medium rounded transition-colors ${
              actionLoading === 'reject' ? 'opacity-50 cursor-not-allowed' : 'text-red-700 hover:bg-red-50'
            }`}
          >
            {actionLoading === 'reject' ? <Loader2 className="h-3 w-3 animate-spin" /> : <ThumbsDown className="h-3 w-3" />}
            {actionLoading === 'reject' ? 'Saving...' : 'Reject'}
          </button>
          <button className="flex items-center gap-1 px-2 py-1 text-[10px] font-medium text-indigo-700 hover:bg-indigo-50 rounded transition-colors">
            <MessageSquareText className="h-3 w-3" /> Comment
          </button>
        </div>
      </NodeToolbar>

      <div className="flex items-start gap-2.5">
        <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
          status === 'approved' ? 'bg-green-100'
          : status === 'rejected' ? 'bg-red-100'
          : 'bg-amber-100'
        }`}>
          {status === 'approved' ? (
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          ) : status === 'rejected' ? (
            <XCircle className="h-4 w-4 text-red-600" />
          ) : (
            <ThumbsUp className="h-4 w-4 text-amber-600" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wide">Approval</span>
            <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded border ${
              approvalType === 'any' ? 'bg-amber-100 text-amber-700 border-amber-300' : 'bg-blue-100 text-blue-700 border-blue-300'
            }`}>
              {approvalType === 'any' ? 'Any' : 'All'}
            </span>
            {status === 'approved' && <span className="text-[10px] font-medium text-green-700 bg-green-100 px-1.5 py-0.5 rounded">Approved</span>}
            {status === 'rejected' && <span className="text-[10px] font-medium text-red-700 bg-red-100 px-1.5 py-0.5 rounded">Rejected</span>}
          </div>
          {data.label ? (
            <p className={`text-xs font-medium truncate mt-0.5 ${
              status === 'approved' ? 'text-green-800'
              : status === 'rejected' ? 'text-red-800'
              : 'text-amber-900'
            }`}>
              {String(data.label)}
            </p>
          ) : null}
        </div>
      </div>

      {status === 'pending' && progress > 0 && (
        <div className="mt-2.5">
          <div className="h-1.5 bg-amber-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-amber-500 rounded-full transition-all duration-300"
              style={{ width: `${Math.min(progress * 100, 100)}%` }}
            />
          </div>
          <p className="text-[9px] text-amber-600 mt-0.5">{approvedCount} of {totalNeeded} approved</p>
        </div>
      )}

      {checklist.length > 0 && instanceMode && (
        <div className="mt-2.5 pt-2 border-t border-amber-100 space-y-1">
          <p className="text-[9px] font-medium text-muted-foreground uppercase tracking-wide">Checklist</p>
          {checklist.map((ci) => (
            <label key={ci.id} className="flex items-center gap-1.5 cursor-pointer py-0.5">
              <input
                type="checkbox"
                checked={!!ci.completed}
                onChange={() => onChecklistToggle?.(id, ci.id, !ci.completed)}
                className="h-3 w-3 rounded border-gray-300 text-amber-600 focus:ring-amber-500"
              />
              <span className={`text-[10px] ${ci.completed ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                {ci.label}
              </span>
            </label>
          ))}
        </div>
      )}

      <div className="mt-2.5 pt-2 border-t border-amber-100 space-y-1.5">
        {assignees && assignees.length > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap">
            <div className="flex -space-x-1">
              {assignees.slice(0, 3).map((a, i) => (
                <div key={a.id} className={`h-5 w-5 rounded-full text-white text-[8px] flex items-center justify-center font-bold ring-1 ring-white ${
                  approvedBy.includes(a.id) ? 'bg-green-500'
                  : rejectedBy.includes(a.id) ? 'bg-red-500'
                  : 'bg-amber-500'
                }`} title={a.name || a.id}>
                  {a.name?.charAt(0)?.toUpperCase() || a.id.charAt(0).toUpperCase() || '?'}
                </div>
              ))}
            </div>
            <span className="text-[10px] text-amber-600 font-medium truncate max-w-[120px]">
              {assignees.slice(0, 1).map((a) => a.name).filter(Boolean).join(', ')}
              {assignees.length > 1 && ` +${assignees.length - 1}`}
            </span>
          </div>
        )}
        <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
          {status === 'pending' && dueDate && (
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" /> Due {new Date(dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </span>
          )}
          {status === 'pending' && (
            <span className="flex items-center gap-1 text-amber-500">
              <Clock className="h-3 w-3" /> Pending
            </span>
          )}
          {status === 'approved' && (
            <span className="flex items-center gap-1 text-green-600">
              <CheckCircle2 className="h-3 w-3" /> Approved
            </span>
          )}
          {status === 'rejected' && rejectionBehavior === 'redirect' && (
            <span className="text-[10px] text-red-500 font-medium">Redirects on reject</span>
          )}
        </div>
      </div>
    </div>
  );
}
