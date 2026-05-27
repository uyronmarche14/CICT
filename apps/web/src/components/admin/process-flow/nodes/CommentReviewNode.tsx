'use client';

import { Handle, Position, NodeToolbar, type NodeProps } from '@xyflow/react';
import { MessageSquareText, ThumbsUp, MessageSquarePlus } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function CommentReviewNode({ data, selected }: NodeProps) {
  const minReviewers = data.minApprovers as number | undefined;

  return (
    <div className={`px-4 py-3 rounded-lg border-2 bg-white shadow-md min-w-[200px] transition-shadow ${selected ? 'border-indigo-500 shadow-lg ring-2 ring-indigo-200' : 'border-indigo-300 hover:shadow-lg'}`}>
      <Handle type="target" position={Position.Top} className="!bg-indigo-400" />
      <Handle type="source" position={Position.Bottom} className="!bg-indigo-400" />
      <NodeToolbar isVisible={selected} position={Position.Top}>
        <div className="flex gap-1 bg-background border rounded-lg p-1 shadow-md">
          <Button size="sm" variant="ghost" className="h-6 px-1.5 text-[10px] gap-1 font-medium text-green-700 hover:text-green-700 hover:bg-green-50">
            <ThumbsUp className="h-3 w-3" /> Approve
          </Button>
          <Button size="sm" variant="ghost" className="h-6 px-1.5 text-[10px] gap-1 font-medium text-indigo-700 hover:text-indigo-700 hover:bg-indigo-50">
            <MessageSquarePlus className="h-3 w-3" /> Add Review
          </Button>
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
