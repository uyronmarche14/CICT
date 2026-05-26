'use client';

import { useCallback } from 'react';
import { Button } from '@/components/ui/button';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Plus, LayoutGrid, Trash2, Maximize2, Minimize2 } from 'lucide-react';
import { ProcessNodeType } from '@/types';

interface ProcessFlowToolbarProps {
  selectedNodeId: string | null;
  onAddNode?: (type: string) => void;
  onAutoLayout?: () => void;
  onDeleteSelected?: () => void;
  onFullscreen: () => void;
  isFullscreen: boolean;
  isInstanceMode?: boolean;
}

const NODE_TYPE_OPTIONS = [
  { value: ProcessNodeType.START, label: 'Start' },
  { value: ProcessNodeType.TASK, label: 'Task' },
  { value: ProcessNodeType.APPROVAL, label: 'Approval' },
  { value: ProcessNodeType.DOCUMENT_REQUIREMENT, label: 'Document' },
  { value: ProcessNodeType.COMMENT_REVIEW, label: 'Review' },
  { value: ProcessNodeType.END, label: 'End' },
];

export function ProcessFlowToolbar({
  selectedNodeId,
  onAddNode,
  onAutoLayout,
  onDeleteSelected,
  onFullscreen,
  isFullscreen,
  isInstanceMode,
}: ProcessFlowToolbarProps) {
  const handleAdd = useCallback(
    (value: string) => {
      if (value && onAddNode) onAddNode(value);
    },
    [onAddNode]
  );

  return (
    <div className="flex items-center gap-2 p-3 border-b bg-muted/30">
      {!isInstanceMode && (
        <>
          <div className="flex items-center gap-1.5">
            <Select onValueChange={handleAdd}>
              <SelectTrigger className="h-8 w-[140px] text-xs">
                <SelectValue placeholder="Add node..." />
              </SelectTrigger>
              <SelectContent>
                {NODE_TYPE_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="w-px h-6 bg-border mx-1" />
          <Button variant="ghost" size="sm" className="h-8 text-xs" onClick={onAutoLayout}>
            <LayoutGrid className="h-3.5 w-3.5 mr-1" />
            Auto Layout
          </Button>
          <div className="flex-1" />
          {selectedNodeId && (
            <Button variant="ghost" size="sm" className="h-8 text-xs text-destructive" onClick={onDeleteSelected}>
              <Trash2 className="h-3.5 w-3.5 mr-1" />
              Delete
            </Button>
          )}
        </>
      )}
      {isInstanceMode && <div className="flex-1" />}
      <Button variant="ghost" size="sm" className="h-8 text-xs" onClick={onFullscreen}>
        {isFullscreen ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
      </Button>
    </div>
  );
}
