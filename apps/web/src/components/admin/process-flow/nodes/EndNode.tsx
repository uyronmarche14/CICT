'use client';

import { Handle, Position, NodeToolbar, type NodeProps } from '@xyflow/react';
import { CheckCircle2, Bell } from 'lucide-react';

export function EndNode({ data, selected }: NodeProps) {
  return (
    <div className={`px-4 py-3 rounded-full border-2 bg-white shadow-md min-w-[160px] transition-shadow ${selected ? 'border-slate-500 shadow-lg ring-2 ring-slate-200' : 'border-slate-300 hover:shadow-lg'}`}>
      <Handle type="target" position={Position.Top} className="!bg-slate-400" />
      <NodeToolbar isVisible={selected} position={Position.Top}>
        <div className="flex gap-1 bg-background border rounded-lg p-1 shadow-md">
          <span className="text-[10px] px-2 py-1 text-muted-foreground">Process ends here</span>
        </div>
      </NodeToolbar>
      <div className="flex items-center gap-2.5">
        <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center">
          <CheckCircle2 className="h-4 w-4 text-slate-600" />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-bold text-slate-800 uppercase tracking-wide">End</span>
            {!!data.notifyOnComplete && <Bell className="h-3 w-3 text-slate-500" />}
          </div>
          {data.label ? <p className="text-xs text-slate-700 font-medium truncate mt-0.5">{String(data.label)}</p> : null}
        </div>
      </div>
    </div>
  );
}
