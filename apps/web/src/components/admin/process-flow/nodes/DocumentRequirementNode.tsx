'use client';

import { Handle, Position, NodeToolbar, type NodeProps } from '@xyflow/react';
import { FileText, Upload, CheckCircle2, FileType } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function DocumentRequirementNode({ data, selected }: NodeProps) {
  const docs = data.requiredDocuments as string[] | undefined;
  const maxSize = data.maxFileSize as number | undefined;

  return (
    <div className={`px-4 py-3 rounded-lg border-2 bg-white shadow-md min-w-[200px] transition-shadow ${selected ? 'border-purple-500 shadow-lg ring-2 ring-purple-200' : 'border-purple-300 hover:shadow-lg'}`}>
      <Handle type="target" position={Position.Top} className="!bg-purple-400" />
      <Handle type="source" position={Position.Bottom} className="!bg-purple-400" />
      <NodeToolbar isVisible={selected} position={Position.Top}>
        <div className="flex gap-1 bg-background border rounded-lg p-1 shadow-md">
          <Button size="sm" variant="ghost" className="h-6 px-1.5 text-[10px] gap-1 font-medium text-purple-700 hover:text-purple-700 hover:bg-purple-50">
            <Upload className="h-3 w-3" /> Upload
          </Button>
          <Button size="sm" variant="ghost" className="h-6 px-1.5 text-[10px] gap-1 font-medium text-green-700 hover:text-green-700 hover:bg-green-50">
            <CheckCircle2 className="h-3 w-3" /> Mark Complete
          </Button>
        </div>
      </NodeToolbar>

      <div className="flex items-start gap-2.5">
        <div className="h-8 w-8 rounded-lg bg-purple-100 flex items-center justify-center shrink-0 mt-0.5">
          <FileText className="h-4 w-4 text-purple-600" />
        </div>
        <div className="min-w-0 flex-1">
          <span className="text-[11px] font-bold text-purple-800 uppercase tracking-wide">Document</span>
          {data.label ? <p className="text-xs text-purple-900 font-medium truncate mt-0.5">{String(data.label)}</p> : null}
        </div>
      </div>

      <div className="mt-2.5 pt-2 border-t border-purple-100 space-y-1.5">
        {docs && docs.length > 0 && (
          <div className="flex items-center gap-1 flex-wrap">
            <FileType className="h-3 w-3 text-purple-400 shrink-0" />
            <span className="text-[10px] text-purple-700">{docs.join(', ')}</span>
          </div>
        )}
        <div className="text-[10px] text-muted-foreground">
          {maxSize ? `Max ${maxSize}MB per file` : 'No size limit'}
        </div>
      </div>
    </div>
  );
}
