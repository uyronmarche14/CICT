'use client';

import { useState, useEffect, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Trash2, ArrowRight } from 'lucide-react';

interface EdgeInspectorPanelProps {
  edgeId: string | null;
  edgeLabel: string;
  edgeSource: string;
  edgeTarget: string;
  edgeStyle?: string;
  onSave: (label: string, style: string) => void;
  onCancel: () => void;
  onDelete: () => void;
  onDirtyChange?: (dirty: boolean) => void;
}

const EDGE_STYLE_OPTIONS = [
  { value: 'normal', label: 'Normal (solid)', color: '#94a3b8' },
  { value: 'approval', label: 'Approval (green)', color: '#22c55e' },
  { value: 'rejection', label: 'Rejection (dashed red)', color: '#ef4444' },
  { value: 'conditional', label: 'Conditional (dashed amber)', color: '#f59e0b' },
  { value: 'animated', label: 'Active (animated blue)', color: '#3b82f6' },
];

export function EdgeInspectorPanel({
  edgeId,
  edgeLabel,
  edgeSource,
  edgeTarget,
  edgeStyle = 'normal',
  onSave,
  onCancel,
  onDelete,
  onDirtyChange,
}: EdgeInspectorPanelProps) {
  const [localLabel, setLocalLabel] = useState(edgeLabel);
  const [localStyle, setLocalStyle] = useState(edgeStyle);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    onDirtyChange?.(hasChanges);
  }, [hasChanges, onDirtyChange]);

  useEffect(() => {
    setLocalLabel(edgeLabel);
    setLocalStyle(edgeStyle);
    setHasChanges(false);
  }, [edgeId, edgeLabel, edgeStyle]);

  useEffect(() => {
    setHasChanges(localLabel !== edgeLabel || localStyle !== edgeStyle);
  }, [localLabel, localStyle, edgeLabel, edgeStyle]);

  const handleSave = useCallback(() => {
    onSave(localLabel, localStyle);
    setHasChanges(false);
  }, [localLabel, localStyle, onSave]);

  if (!edgeId) {
    return (
      <div className="px-2 py-16 text-sm text-muted-foreground text-center">
        Select a connection to edit its properties
      </div>
    );
  }

  const selectedStyle = EDGE_STYLE_OPTIONS.find((s) => s.value === localStyle);

  return (
    <div className="space-y-7 px-2">
      <div>
        <h3 className="text-sm font-medium">Connection</h3>
        <p className="text-xs text-muted-foreground font-mono mt-0.5">{edgeId}</p>
      </div>

      <Separator className="my-2" />

      <div className="flex items-center gap-3 p-4 bg-muted/30 rounded-lg text-xs">
        <span className="font-medium truncate min-w-0 flex-1 text-right">{edgeSource}</span>
        <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />
        <span className="font-medium truncate min-w-0 flex-1">{edgeTarget}</span>
      </div>

      <div className="space-y-3">
        <Label className="text-xs font-medium">Label (optional)</Label>
        <Input
          value={localLabel}
          onChange={(e) => setLocalLabel(e.target.value)}
          className="h-10 text-xs"
          placeholder="e.g., Approved, Submit, Rejected"
        />
      </div>

      <div className="space-y-3">
        <Label className="text-xs font-medium">Edge Style</Label>
        <Select value={localStyle} onValueChange={setLocalStyle}>
          <SelectTrigger className="h-10 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {EDGE_STYLE_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                <div className="flex items-center gap-2">
                  <span className="h-3 w-6 rounded" style={{ backgroundColor: opt.color }} />
                  <span>{opt.label}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {selectedStyle && (
          <div className="flex items-center gap-2 mt-1.5">
            <span className="h-0.5 w-8 rounded" style={{ backgroundColor: selectedStyle.color }} />
            <span className="text-[10px] text-muted-foreground">{selectedStyle.label}</span>
          </div>
        )}
      </div>

      <Separator className="my-2" />

      <div className="flex gap-4 px-1">
        <Button size="default" className="flex-1 h-10 text-xs font-medium" onClick={handleSave} disabled={!hasChanges}>
          Save Changes
        </Button>
        <Button size="default" variant="outline" className="flex-1 h-10 text-xs font-medium" onClick={onCancel}>
          Cancel
        </Button>
      </div>

      <Button variant="destructive" size="default" className="w-full h-10 text-xs font-medium" onClick={onDelete}>
        <Trash2 className="h-3.5 w-3.5 mr-1.5" />
        Delete Connection
      </Button>
    </div>
  );
}
