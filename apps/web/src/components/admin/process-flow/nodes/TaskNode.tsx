'use client';

import { useCallback, useState } from 'react';
import { Handle, Position, NodeToolbar, type NodeProps } from '@xyflow/react';
import { ClipboardList, Calendar, Clock, CheckCircle2, MessageSquareText, CheckSquare, Loader2 } from 'lucide-react';

const PRIORITY_STYLES: Record<string, { label: string; color: string }> = {
  low: { label: 'Low', color: 'bg-slate-100 text-slate-700 border-slate-300' },
  medium: { label: 'Medium', color: 'bg-blue-100 text-blue-700 border-blue-300' },
  high: { label: 'High', color: 'bg-orange-100 text-orange-700 border-orange-300' },
  critical: { label: 'Critical', color: 'bg-red-100 text-red-700 border-red-300' },
};

export function TaskNode({ id, data, selected }: NodeProps) {
  const [actionLoading, setActionLoading] = useState(false);
  const assignees = data.assignees as Array<{ type: string; id: string; name?: string }> | undefined;
  const priority = String(data.priority || 'medium');
  const dueDate = String(data.dueDate || '');
  const estimatedHours = data.estimatedHours as number | undefined;
  const instanceMode = !!data._instanceMode;
  const isActive = !!data._instanceActive;
  const isCompleted = instanceMode ? !!data._instanceCompleted : !!data.completed;
  const pStyle = PRIORITY_STYLES[priority] || PRIORITY_STYLES.medium;
  const onToggleComplete = data.onToggleComplete as ((id: string) => void) | undefined;
  const onChecklistToggle = data.onChecklistToggle as ((nodeId: string, itemId: string, completed: boolean) => void) | undefined;
  const checklist = (data.checklist as Array<{ id: string; label: string; completed?: boolean }>) || [];

  const handleToggle = useCallback(() => {
    if (actionLoading) return;
    setActionLoading(true);
    onToggleComplete?.(id);
    setTimeout(() => setActionLoading(false), 2000);
  }, [onToggleComplete, id, actionLoading]);

  return (
    <div className={`px-4 py-3 rounded-xl border-2 bg-white shadow-md min-w-[220px] transition-all duration-200
      ${selected ? 'border-blue-500 shadow-lg ring-2 ring-blue-200' : isCompleted ? 'border-green-300' : 'border-blue-300 hover:shadow-lg'}
      ${isCompleted ? 'opacity-70' : ''}`}>
      <Handle type="target" position={Position.Top} className="!bg-blue-400" />
      <Handle type="source" position={Position.Bottom} className="!bg-blue-400" />
      <NodeToolbar isVisible={selected} position={Position.Top}>
        <div className="flex gap-1 bg-background border rounded-lg p-1 shadow-md">
          <button
            onClick={handleToggle}
            disabled={actionLoading}
            className={`flex items-center gap-1 px-2 py-1 text-[10px] font-medium rounded transition-colors ${
              actionLoading ? 'opacity-50 cursor-not-allowed' : ''
            } ${isCompleted ? 'text-green-700 bg-green-50' : 'text-slate-600 hover:bg-slate-50'}`}
          >
            {actionLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : isCompleted ? <CheckCircle2 className="h-3 w-3" /> : <CheckSquare className="h-3 w-3" />}
            {actionLoading ? 'Saving...' : isCompleted ? 'Completed' : 'Mark Complete'}
          </button>
          <button className="flex items-center gap-1 px-2 py-1 text-[10px] font-medium text-indigo-700 hover:bg-indigo-50 rounded transition-colors">
            <MessageSquareText className="h-3 w-3" /> Comment
          </button>
        </div>
      </NodeToolbar>

      <div className="flex items-start gap-2.5">
        <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
          isCompleted ? 'bg-green-100' : 'bg-blue-100'
        }`}>
          {isCompleted ? (
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          ) : (
            <ClipboardList className="h-4 w-4 text-blue-600" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] font-bold text-blue-800 uppercase tracking-wide">Task</span>
            <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded border ${pStyle.color}`}>{pStyle.label}</span>
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <input
              type="checkbox"
              checked={isCompleted}
              onChange={handleToggle}
              className="h-3.5 w-3.5 rounded border-gray-300 text-green-600 focus:ring-green-500 shrink-0 cursor-pointer"
            />
            {data.label ? (
              <p className={`text-xs font-medium truncate ${isCompleted ? 'text-green-700 line-through' : 'text-blue-900'}`}>
                {String(data.label)}
              </p>
            ) : null}
          </div>
        </div>
      </div>

      {checklist.length > 0 && instanceMode && (
        <div className="mt-2.5 pt-2 border-t border-blue-100 space-y-1">
          <p className="text-[9px] font-medium text-muted-foreground uppercase tracking-wide">Checklist</p>
          {checklist.map((ci) => (
            <label key={ci.id} className="flex items-center gap-1.5 cursor-pointer py-0.5">
              <input
                type="checkbox"
                checked={!!ci.completed}
                onChange={() => onChecklistToggle?.(id, ci.id, !ci.completed)}
                className="h-3 w-3 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className={`text-[10px] ${ci.completed ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                {ci.label}
              </span>
            </label>
          ))}
        </div>
      )}

      <div className={`mt-2.5 pt-2 border-t space-y-1.5 ${isCompleted ? 'border-green-200' : 'border-blue-100'}`}>
        {assignees && assignees.length > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap">
            <div className="flex -space-x-1">
              {assignees.slice(0, 4).map((a, i) => (
                <div key={a.id} className="h-5 w-5 rounded-full bg-blue-500 text-white text-[8px] flex items-center justify-center font-bold ring-1 ring-white" title={a.name || a.id}>
                  {a.name?.charAt(0)?.toUpperCase() || a.id.charAt(0).toUpperCase() || '?'}
                </div>
              ))}
            </div>
            <span className="text-[10px] text-blue-600 font-medium truncate max-w-[120px]">
              {assignees.slice(0, 2).map((a) => a.name).filter(Boolean).join(', ')}
              {assignees.length > 2 && ` +${assignees.length - 2}`}
            </span>
          </div>
        )}
        <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
          {dueDate && (
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" /> {new Date(dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </span>
          )}
          {estimatedHours && (
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" /> {estimatedHours}h
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
