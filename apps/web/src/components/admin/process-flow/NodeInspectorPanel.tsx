'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { AssigneeSelect } from './AssigneeSelect';
import { DatePicker } from '@/components/ui/DatePicker';
import { Plus, Trash2 } from 'lucide-react';
import type { AssigneeItem } from '@/types/nodes';

function ChecklistEditor({
  items = [],
  onChange,
}: {
  items?: Array<{ id: string; label: string }>;
  onChange: (items: Array<{ id: string; label: string }>) => void;
}) {
  const [newLabel, setNewLabel] = useState('');

  const addItem = useCallback(() => {
    if (!newLabel.trim()) return;
    const id = `ci-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
    onChange([...items, { id, label: newLabel.trim() }]);
    setNewLabel('');
  }, [newLabel, items, onChange]);

  const removeItem = useCallback((id: string) => {
    onChange(items.filter((i) => i.id !== id));
  }, [items, onChange]);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Input
          value={newLabel}
          onChange={(e) => setNewLabel(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') addItem(); }}
          className="h-9 text-xs flex-1"
          placeholder="Add checklist item..."
        />
        <Button size="sm" variant="outline" className="h-9 text-xs shrink-0" onClick={addItem} disabled={!newLabel.trim()}>
          <Plus className="h-3.5 w-3.5 mr-1" /> Add
        </Button>
      </div>
      {items.length > 0 && (
        <div className="space-y-1.5">
          {items.map((item) => (
            <div key={item.id} className="flex items-center gap-2 px-2 py-1.5 rounded border text-xs">
              <span className="flex-1 truncate">{item.label}</span>
              <button onClick={() => removeItem(item.id)} className="text-muted-foreground hover:text-destructive transition-colors shrink-0">
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

interface NodeDraft {
  label: string;
  type: string;
  data: Record<string, unknown>;
  assignees: AssigneeItem[];
}

interface NodeInspectorPanelProps {
  nodeId: string | null;
  nodeType: string | null;
  nodeLabel: string;
  nodeData: Record<string, unknown>;
  assignees: AssigneeItem[];
  allNodeIds: string[];
  onSave: (nodeId: string, draft: NodeDraft) => void;
  onCancel: () => void;
  onDirtyChange?: (dirty: boolean) => void;
}

const NODE_TYPE_OPTIONS = [
  { value: 'start', label: 'Start' },
  { value: 'task', label: 'Task' },
  { value: 'approval', label: 'Approval' },
  { value: 'document_requirement', label: 'Document' },
  { value: 'comment_review', label: 'Review' },
  { value: 'end', label: 'End' },
];

function NodeTypeConfigSection({
  nodeType,
  data,
  onChange,
  allNodeIds,
  currentNodeId,
}: {
  nodeType: string;
  data: Record<string, unknown>;
  onChange: (key: string, value: unknown) => void;
  allNodeIds: string[];
  currentNodeId: string;
}) {
  const set = (key: string, value: unknown) => onChange(key, value);

  switch (nodeType) {
    case 'task':
      return (
        <div className="space-y-5">
          <Separator className="mb-2" />
          <p className="text-xs font-medium text-muted-foreground">Task Configuration</p>
          <div className="space-y-2.5">
            <Label className="text-xs font-medium">Priority</Label>
            <Select value={String(data.priority || 'medium')} onValueChange={(v) => set('priority', v)}>
              <SelectTrigger className="h-10 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2.5">
            <Label className="text-xs font-medium">Estimated Hours</Label>
            <Input type="number" min={0} step={0.5}
              value={String(data.estimatedHours || '')}
              onChange={(e) => set('estimatedHours', e.target.value ? Number(e.target.value) : undefined)}
              className="h-10 text-xs"
            />
          </div>
          <div className="space-y-2.5">
            <Label className="text-xs font-medium">Due Date</Label>
            <DatePicker value={String(data.dueDate || '')} onChange={(v) => set('dueDate', v)} />
          </div>
          <div className="space-y-2.5">
            <Label className="text-xs font-medium">Instructions</Label>
            <Textarea
              value={String(data.instructions || '')}
              onChange={(e) => set('instructions', e.target.value || undefined)}
              className="text-xs min-h-[80px]"
              placeholder="Describe what needs to be done..."
            />
          </div>
          <Separator className="mb-2" />
          <p className="text-xs font-medium text-muted-foreground">Checklist</p>
          <ChecklistEditor
            items={(data.checklist as Array<{ id: string; label: string }>) || []}
            onChange={(list) => set('checklist', list)}
          />
        </div>
      );

    case 'approval':
      return (
        <div className="space-y-5">
          <Separator className="mb-2" />
          <p className="text-xs font-medium text-muted-foreground">Approval Configuration</p>
          <div className="space-y-2.5">
            <Label className="text-xs font-medium">Approval Type</Label>
            <RadioGroup value={String(data.approvalType || 'all')} onValueChange={(v) => set('approvalType', v)} className="gap-2">
              <div className="flex items-center gap-2">
                <RadioGroupItem value="any" id="approval-any" />
                <Label htmlFor="approval-any" className="text-xs font-normal cursor-pointer">Any (one approver)</Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="all" id="approval-all" />
                <Label htmlFor="approval-all" className="text-xs font-normal cursor-pointer">All (all must approve)</Label>
              </div>
            </RadioGroup>
          </div>
          <div className="space-y-2.5">
            <Label className="text-xs font-medium">Minimum Approvers</Label>
            <Input type="number" min={1} max={20}
              value={String(data.minApprovers || 1)}
              onChange={(e) => set('minApprovers', Number(e.target.value))}
              className="h-10 text-xs"
            />
          </div>
          <div className="space-y-2.5">
            <Label className="text-xs font-medium">On Rejection</Label>
            <Select value={String(data.rejectionBehavior || 'revise')} onValueChange={(v) => set('rejectionBehavior', v)}>
              <SelectTrigger className="h-10 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="revise">Allow revision & resubmit</SelectItem>
                <SelectItem value="end">End process</SelectItem>
                <SelectItem value="redirect">Redirect to another node</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {data.rejectionBehavior === 'redirect' && (
            <div className="space-y-2.5">
              <Label className="text-xs font-medium">Redirect To</Label>
              <Select value={String(data.rejectionTargetNodeId || '')} onValueChange={(v) => set('rejectionTargetNodeId', v)}>
                <SelectTrigger className="h-10 text-xs"><SelectValue placeholder="Select node..." /></SelectTrigger>
                <SelectContent>
                  {allNodeIds.filter((nid) => nid !== currentNodeId).map((nid) => (
                    <SelectItem key={nid} value={nid}>{nid}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          <div className="space-y-2.5">
            <Label className="text-xs font-medium">Due Date</Label>
            <DatePicker value={String(data.dueDate || '')} onChange={(v) => set('dueDate', v)} />
          </div>
          <div className="space-y-2.5">
            <Label className="text-xs font-medium">Approval Instructions</Label>
            <Textarea
              value={String(data.instructions || '')}
              onChange={(e) => set('instructions', e.target.value || undefined)}
              className="text-xs min-h-[80px]"
              placeholder="Criteria for approval..."
            />
          </div>
          <Separator className="mb-2" />
          <p className="text-xs font-medium text-muted-foreground">Checklist</p>
          <ChecklistEditor
            items={(data.checklist as Array<{ id: string; label: string }>) || []}
            onChange={(list) => set('checklist', list)}
          />
        </div>
      );

    case 'document_requirement':
      return (
        <div className="space-y-5">
          <Separator className="mb-2" />
          <p className="text-xs font-medium text-muted-foreground">Document Requirements</p>
          <div className="space-y-2.5">
            <Label className="text-xs font-medium">Required Documents (comma-separated)</Label>
            <Input
              value={((data.requiredDocuments as string[]) || []).join(', ')}
              onChange={(e) => set('requiredDocuments', e.target.value ? e.target.value.split(',').map((s) => s.trim()) : undefined)}
              className="h-10 text-xs"
              placeholder="e.g., ID, Form 137, Good Moral"
            />
          </div>
          <div className="space-y-2.5">
            <Label className="text-xs font-medium">Accepted File Types</Label>
            <Select value={String(data.acceptFileTypes || 'all')} onValueChange={(v) => set('acceptFileTypes', v === 'all' ? undefined : [v])}>
              <SelectTrigger className="h-10 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All file types</SelectItem>
                <SelectItem value="pdf">PDF only</SelectItem>
                <SelectItem value="image">Images only</SelectItem>
                <SelectItem value="document">Documents (PDF, DOC, DOCX)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2.5">
            <Label className="text-xs font-medium">Max File Size (MB)</Label>
            <Input type="number" min={1} max={100}
              value={String(data.maxFileSize || 10)}
              onChange={(e) => set('maxFileSize', Number(e.target.value))}
              className="h-10 text-xs"
            />
          </div>
          <Separator className="mb-2" />
          <p className="text-xs font-medium text-muted-foreground">Checklist</p>
          <ChecklistEditor
            items={(data.checklist as Array<{ id: string; label: string }>) || []}
            onChange={(list) => set('checklist', list)}
          />
        </div>
      );

    case 'comment_review':
      return (
        <div className="space-y-5">
          <Separator className="mb-2" />
          <p className="text-xs font-medium text-muted-foreground">Review Configuration</p>
          <div className="space-y-2.5">
            <Label className="text-xs font-medium">Minimum Reviewers</Label>
            <Input type="number" min={1} max={20}
              value={String(data.minApprovers || 1)}
              onChange={(e) => set('minApprovers', Number(e.target.value))}
              className="h-10 text-xs"
            />
          </div>
          <div className="space-y-2.5">
            <Label className="text-xs font-medium">Review Instructions</Label>
            <Textarea
              value={String(data.instructions || '')}
              onChange={(e) => set('instructions', e.target.value || undefined)}
              className="text-xs min-h-[80px]"
              placeholder="What reviewers should look for..."
            />
          </div>
          <Separator className="mb-2" />
          <p className="text-xs font-medium text-muted-foreground">Checklist</p>
          <ChecklistEditor
            items={(data.checklist as Array<{ id: string; label: string }>) || []}
            onChange={(list) => set('checklist', list)}
          />
        </div>
      );

    case 'start':
      return (
        <div className="space-y-5">
          <Separator className="mb-2" />
          <p className="text-xs font-medium text-muted-foreground">Trigger Configuration</p>
          <div className="space-y-2.5">
            <Label className="text-xs font-medium">Trigger Type</Label>
            <RadioGroup value={String(data.triggerType || 'manual')} onValueChange={(v) => set('triggerType', v)} className="gap-2">
              <div className="flex items-center gap-2">
                <RadioGroupItem value="manual" id="trigger-manual" />
                <Label htmlFor="trigger-manual" className="text-xs font-normal cursor-pointer">Manual (admin starts)</Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="automatic" id="trigger-auto" />
                <Label htmlFor="trigger-auto" className="text-xs font-normal cursor-pointer">Automatic (on content publish)</Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="scheduled" id="trigger-scheduled" />
                <Label htmlFor="trigger-scheduled" className="text-xs font-normal cursor-pointer">Scheduled (cron)</Label>
              </div>
            </RadioGroup>
          </div>
        </div>
      );

    default:
      return null;
  }
}

export function NodeInspectorPanel({
  nodeId,
  nodeType,
  nodeLabel,
  nodeData,
  assignees,
  allNodeIds,
  onSave,
  onCancel,
  onDirtyChange,
}: NodeInspectorPanelProps) {
  const [draftLabel, setDraftLabel] = useState(nodeLabel);
  const [draftType, setDraftType] = useState(nodeType || '');
  const [draftData, setDraftData] = useState<Record<string, unknown>>({});
  const [draftAssignees, setDraftAssignees] = useState<AssigneeItem[]>([]);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    onDirtyChange?.(hasChanges);
  }, [hasChanges, onDirtyChange]);

  useEffect(() => {
    if (nodeId) {
      setDraftLabel(nodeLabel);
      setDraftType(nodeType || '');
      setDraftData({ ...nodeData });
      setDraftAssignees(assignees.map((a) => ({ ...a })));
      setHasChanges(false);
    }
  }, [nodeId, nodeLabel, nodeType]);

  useEffect(() => {
    const changed =
      draftLabel !== nodeLabel ||
      draftType !== nodeType ||
      JSON.stringify(draftData) !== JSON.stringify(nodeData) ||
      JSON.stringify(draftAssignees) !== JSON.stringify(assignees);
    setHasChanges(changed);
  }, [draftLabel, draftType, draftData, draftAssignees, nodeLabel, nodeType, nodeData, assignees]);

  const updateData = useCallback((key: string, value: unknown) => {
    setDraftData((prev) => ({ ...prev, [key]: value }));
  }, []);

  const handleSave = useCallback(() => {
    if (!nodeId) return;
    onSave(nodeId, {
      label: draftLabel,
      type: draftType,
      data: { ...draftData },
      assignees: [...draftAssignees],
    });
    setHasChanges(false);
  }, [nodeId, draftLabel, draftType, draftData, draftAssignees, onSave]);

  const handleCancel = useCallback(() => {
    onCancel();
  }, [onCancel]);

  if (!nodeId) {
    return (
      <div className="px-2 py-16 text-sm text-muted-foreground text-center">
        Select a node to edit its properties
      </div>
    );
  }

  return (
    <div className="space-y-7 px-2">
      <div className="space-y-1">
        <p className="text-xs text-muted-foreground font-mono">ID: {nodeId}</p>
      </div>

      <div className="space-y-3">
        <Label className="text-xs font-medium">Type</Label>
        <Select value={draftType} onValueChange={setDraftType}>
          <SelectTrigger className="h-10 text-xs">
            <SelectValue />
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

      <div className="space-y-3">
        <Label className="text-xs font-medium">Label</Label>
        <Input
          value={draftLabel}
          onChange={(e) => setDraftLabel(e.target.value)}
          className="h-10 text-xs"
          placeholder="Node display label"
        />
      </div>

      <Separator className="my-2" />

      <div className="space-y-3">
        <Label className="text-xs font-medium">Assignees</Label>
        <AssigneeSelect value={draftAssignees} onChange={setDraftAssignees} />
      </div>

      {draftType && (
        <NodeTypeConfigSection
          nodeType={draftType}
          data={draftData}
          onChange={updateData}
          allNodeIds={allNodeIds}
          currentNodeId={nodeId}
        />
      )}

      <div className="flex gap-4 pt-6 border-t mt-8 px-1">
        <Button size="default" className="flex-1 h-10 text-xs font-medium" onClick={handleSave} disabled={!hasChanges}>
          Save Changes
        </Button>
        <Button size="default" variant="outline" className="flex-1 h-10 text-xs font-medium" onClick={handleCancel}>
          Cancel
        </Button>
      </div>
    </div>
  );
}
