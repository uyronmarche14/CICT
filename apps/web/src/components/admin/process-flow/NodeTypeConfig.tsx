'use client';

import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { DatePicker } from '@/components/ui/DatePicker';

interface NodeTypeConfigProps {
  nodeType: string;
  data: Record<string, unknown>;
  onUpdate: (key: string, value: unknown) => void;
  allNodeIds: string[];
  currentNodeId: string;
}

export function NodeTypeConfig({ nodeType, data, onUpdate, allNodeIds, currentNodeId }: NodeTypeConfigProps) {
  const set = (key: string, value: unknown) => onUpdate(key, value);

  switch (nodeType) {
    case 'task':
      return (
        <div className="space-y-3">
          <Separator />
          <p className="text-xs font-medium text-muted-foreground">Task Configuration</p>
          <div className="space-y-1.5">
            <Label className="text-xs">Priority</Label>
            <Select value={String(data.priority || 'medium')} onValueChange={(v) => set('priority', v)}>
              <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Estimated Hours</Label>
            <Input type="number" min={0} step={0.5}
              value={String(data.estimatedHours || '')}
              onChange={(e) => set('estimatedHours', e.target.value ? Number(e.target.value) : undefined)}
              className="h-8 text-xs"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Due Date</Label>
            <DatePicker value={String(data.dueDate || '')} onChange={(v) => set('dueDate', v)} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Instructions</Label>
            <Textarea
              value={String(data.instructions || '')}
              onChange={(e) => set('instructions', e.target.value || undefined)}
              className="text-xs min-h-[60px]"
              placeholder="Describe what needs to be done..."
            />
          </div>
        </div>
      );

    case 'approval':
      return (
        <div className="space-y-3">
          <Separator className="mb-2" />
          <p className="text-xs font-medium text-muted-foreground">Approval Configuration</p>
          <div className="space-y-1.5">
            <Label className="text-xs">Approval Type</Label>
            <Select value={String(data.approvalType || 'all')} onValueChange={(v) => set('approvalType', v)}>
              <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Any (one approver)</SelectItem>
                <SelectItem value="all">All (all must approve)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Minimum Approvers</Label>
            <Input type="number" min={1} max={20}
              value={String(data.minApprovers || 1)}
              onChange={(e) => set('minApprovers', Number(e.target.value))}
              className="h-8 text-xs"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">On Rejection</Label>
            <Select value={String(data.rejectionBehavior || 'revise')} onValueChange={(v) => set('rejectionBehavior', v)}>
              <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="revise">Allow revision & resubmit</SelectItem>
                <SelectItem value="end">End process</SelectItem>
                <SelectItem value="redirect">Redirect to another node</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {data.rejectionBehavior === 'redirect' && (
            <div className="space-y-1.5">
              <Label className="text-xs">Redirect To</Label>
              <Select value={String(data.rejectionTargetNodeId || '')} onValueChange={(v) => set('rejectionTargetNodeId', v)}>
                <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Select node..." /></SelectTrigger>
                <SelectContent>
                  {allNodeIds.filter((nid) => nid !== currentNodeId).map((nid) => (
                    <SelectItem key={nid} value={nid}>{nid}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          <div className="space-y-1.5">
            <Label className="text-xs">Due Date</Label>
            <DatePicker value={String(data.dueDate || '')} onChange={(v) => set('dueDate', v)} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Approval Instructions</Label>
            <Textarea
              value={String(data.instructions || '')}
              onChange={(e) => set('instructions', e.target.value || undefined)}
              className="text-xs min-h-[60px]"
              placeholder="Criteria for approval..."
            />
          </div>
        </div>
      );

    case 'document_requirement':
      return (
        <div className="space-y-3">
          <Separator />
          <p className="text-xs font-medium text-muted-foreground">Document Requirements</p>
          <div className="space-y-1.5">
            <Label className="text-xs">Required Documents (comma-separated)</Label>
            <Input
              value={((data.requiredDocuments as string[]) || []).join(', ')}
              onChange={(e) => set('requiredDocuments', e.target.value ? e.target.value.split(',').map((s) => s.trim()) : undefined)}
              className="h-8 text-xs"
              placeholder="e.g., ID, Form 137, Good Moral"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Accepted File Types</Label>
            <Select value={String(data.acceptFileTypes || 'all')} onValueChange={(v) => set('acceptFileTypes', v === 'all' ? undefined : [v])}>
              <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All file types</SelectItem>
                <SelectItem value="pdf">PDF only</SelectItem>
                <SelectItem value="image">Images only</SelectItem>
                <SelectItem value="document">Documents (PDF, DOC, DOCX)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Max File Size (MB)</Label>
            <Input type="number" min={1} max={100}
              value={String(data.maxFileSize || 10)}
              onChange={(e) => set('maxFileSize', Number(e.target.value))}
              className="h-8 text-xs"
            />
          </div>
        </div>
      );

    case 'comment_review':
      return (
        <div className="space-y-3">
          <Separator />
          <p className="text-xs font-medium text-muted-foreground">Review Configuration</p>
          <div className="space-y-1.5">
            <Label className="text-xs">Minimum Reviewers</Label>
            <Input type="number" min={1} max={20}
              value={String(data.minApprovers || 1)}
              onChange={(e) => set('minApprovers', Number(e.target.value))}
              className="h-8 text-xs"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Review Instructions</Label>
            <Textarea
              value={String(data.instructions || '')}
              onChange={(e) => set('instructions', e.target.value || undefined)}
              className="text-xs min-h-[60px]"
              placeholder="What reviewers should look for..."
            />
          </div>
        </div>
      );

    case 'start':
      return (
        <div className="space-y-3">
          <Separator />
          <p className="text-xs font-medium text-muted-foreground">Trigger Configuration</p>
          <div className="space-y-1.5">
            <Label className="text-xs">Trigger Type</Label>
            <Select value={String(data.triggerType || 'manual')} onValueChange={(v) => set('triggerType', v)}>
              <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="manual">Manual (admin starts)</SelectItem>
                <SelectItem value="automatic">Automatic (on content publish)</SelectItem>
                <SelectItem value="scheduled">Scheduled (cron)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      );

    default:
      return null;
  }
}
