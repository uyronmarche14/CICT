'use client';

import { Handle, Position, NodeToolbar, type NodeProps } from '@xyflow/react';
import { Play, Zap, Clock } from 'lucide-react';

export function StartNode({ data, selected }: NodeProps) {
  const triggerType = String(data.triggerType || 'manual');

  return (
    <div className={`px-4 py-3 rounded-full border-2 bg-white shadow-md min-w-[160px] transition-shadow ${selected ? 'border-green-500 shadow-lg ring-2 ring-green-200' : 'border-green-400 hover:shadow-lg'}`}>
      <Handle type="source" position={Position.Bottom} className="!bg-green-500" />
      <NodeToolbar isVisible={selected} position={Position.Top}>
        <div className="flex gap-1 bg-background border rounded-lg p-1 shadow-md">
          <span className="text-[10px] px-2 py-1 text-muted-foreground">Trigger: {triggerType}</span>
        </div>
      </NodeToolbar>
      <div className="flex items-center gap-2.5">
        <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
          <Play className="h-4 w-4 text-green-600 fill-green-600" />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-bold text-green-800 uppercase tracking-wide">Start</span>
            {triggerType === 'automatic' && <Zap className="h-3 w-3 text-green-500" />}
            {triggerType === 'scheduled' && <Clock className="h-3 w-3 text-green-500" />}
          </div>
          {data.label ? <p className="text-xs text-green-700 font-medium truncate mt-0.5">{String(data.label)}</p> : null}
        </div>
      </div>
    </div>
  );
}
