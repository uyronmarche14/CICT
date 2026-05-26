'use client';

import { Handle, Position, NodeToolbar, type NodeProps } from '@xyflow/react';
import { MessageSquareText, ThumbsUp, MessageSquarePlus } from 'lucide-react';

export function CommentReviewNode({ data, selected }: NodeProps) {
  const minReviewers = data.minApprovers as number | undefined;

  return (
    <div className={`px-4 py-3 rounded-lg border-2 bg-white shadow-md min-w-[200px] transition-shadow ${selected ? 'border-indigo-500 shadow-lg ring-2 ring-indigo-200' : 'border-indigo-300 hover:shadow-lg'}`}>
      <Handle type="target" position={Position.Top} className="!bg-indigo-400" />
      <Handle type="source" position={Position.Bottom} className="!bg-indigo-400" />
      <NodeToolbar isVisible={selected} position={Position.Top}>
        <div className="flex gap-1 bg-background border rounded-lg p-1 shadow-md">
          <button className="flex items-center gap-1 px-2 py-1 text-[10px] font-medium text-green-700 hover:bg-green-50 rounded transition-colors">
            <ThumbsUp className="h-3 w-3" /> Approve
          </button>
          <button className="flex items-center gap-1 px-2 py-1 text-[10px] font-medium text-indigo-700 hover:bg-indigo-50 rounded transition-colors">
            <MessageSquarePlus className="h-3 w-3" /> Add Review
          </button>
        </div>
      </NodeToolbar>

      <div className="flex items-start gap-2.5">
        <div className="h-8 w-8 rounded-lg bg-indigo-100 flex items-center justify-center shrink-0 mt-0.5">
          <MessageSquareText className="h-4 w-4 text-indigo-600" />
        </div>
        <div className="min-w-0 flex-1">
          <span className="text-[11px] font-bold text-indigo-800 uppercase tracking-wide">Review</span>
          {data.label ? <p className="text-xs text-indigo-900 font-medium truncate mt-0.5">{String(data.label)}</p> : null}
        </div>
      </div>

      <div className="mt-2.5 pt-2 border-t border-indigo-100">
        <div className="text-[10px] text-muted-foreground">
          {minReviewers ? `Requires ${minReviewers} reviewer${minReviewers !== 1 ? 's' : ''}` : 'Review required'}
        </div>
      </div>
    </div>
  );
}
