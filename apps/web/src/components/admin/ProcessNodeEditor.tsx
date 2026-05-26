'use client';

import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Plus, Trash2, Pencil, GripVertical } from 'lucide-react';
import { ProcessNodeType } from '@/types';
import {
  generateNodeId,
  generateEdgeId,
  recalculatePositions,
  NODE_TYPE_META,
} from '@/utils/process-layout';
import type { ProcessNode, ProcessEdge } from '@/lib/api/process';

interface ProcessNodeEditorProps {
  nodes: ProcessNode[];
  edges: ProcessEdge[];
  onChange: (nodes: ProcessNode[], edges: ProcessEdge[]) => void;
}

interface NodeFormData {
  id: string;
  type: string;
  label: string;
}

const NODE_TYPE_OPTIONS = [
  { value: ProcessNodeType.START, label: 'Start' },
  { value: ProcessNodeType.TASK, label: 'Task' },
  { value: ProcessNodeType.APPROVAL, label: 'Approval' },
  { value: ProcessNodeType.DOCUMENT_REQUIREMENT, label: 'Document Requirement' },
  { value: ProcessNodeType.COMMENT_REVIEW, label: 'Comment Review' },
  { value: ProcessNodeType.END, label: 'End' },
];

export function ProcessNodeEditor({ nodes, edges, onChange }: ProcessNodeEditorProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [formData, setFormData] = useState<NodeFormData>({ id: '', type: '', label: '' });

  const openAddDialog = useCallback(() => {
    setFormData({ id: generateNodeId(), type: ProcessNodeType.TASK, label: '' });
    setEditingIndex(null);
    setDialogOpen(true);
  }, []);

  const openEditDialog = useCallback((index: number) => {
    const node = nodes[index];
    if (!node) return;
    setFormData({
      id: node.id,
      type: node.type,
      label: (node.data?.label as string) || '',
    });
    setEditingIndex(index);
    setDialogOpen(true);
  }, [nodes]);

  const saveNode = useCallback(() => {
    if (!formData.type) return;

    const updatedNode: ProcessNode = {
      id: formData.id,
      type: formData.type as ProcessNode['type'],
      position: { x: 0, y: 0 },
      data: { label: formData.label || undefined },
    };

    let updatedNodes: ProcessNode[];
    let updatedEdges = edges;

    if (editingIndex !== null) {
      updatedNodes = nodes.map((n, i) => (i === editingIndex ? updatedNode : n));
    } else {
      updatedNodes = [...nodes, updatedNode];
    }

    const positions = recalculatePositions(updatedNodes);
    updatedNodes = updatedNodes.map((n, i) => ({
      ...n,
      position: { x: positions[i]?.x ?? n.position.x, y: positions[i]?.y ?? n.position.y },
    }));

    if (editingIndex === null) {
      const startNodes = updatedNodes.filter((n) => n.type === 'start');
      const endNodes = updatedNodes.filter((n) => n.type === 'end');

      for (const start of startNodes) {
        if (!updatedEdges.some((e) => e.source === start.id)) {
          const successor = updatedNodes.find(
            (n) => n.id !== start.id && n.type !== 'start' && n.type !== 'end'
          );
          if (successor) {
            updatedEdges = [
              ...updatedEdges,
              { id: generateEdgeId(), source: start.id, target: successor.id },
            ];
          }
        }
      }
    }

    onChange(updatedNodes, updatedEdges);
    setDialogOpen(false);
  }, [formData, editingIndex, nodes, edges, onChange]);

  const deleteNode = useCallback((index: number) => {
    const node = nodes[index];
    if (!node) return;

    const updatedNodes = nodes.filter((_, i) => i !== index);
    const updatedEdges = edges.filter((e) => e.source !== node.id && e.target !== node.id);

    onChange(updatedNodes, updatedEdges);
  }, [nodes, edges, onChange]);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium">Process Nodes</p>
        <Button size="sm" variant="outline" onClick={openAddDialog}>
          <Plus className="mr-1 h-4 w-4" /> Add Node
        </Button>
      </div>

      {nodes.length === 0 ? (
        <div className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground text-center">
          No nodes defined yet. Add a start node to begin building your workflow.
        </div>
      ) : (
        <div className="space-y-2">
          {nodes.map((node, index) => {
            const meta = NODE_TYPE_META[node.type];
            const label = (node.data?.label as string) || '';
            return (
              <div
                key={node.id}
                className="flex items-center gap-3 rounded-lg border p-3 text-sm"
              >
                <GripVertical className="h-4 w-4 text-muted-foreground shrink-0" />
                <Badge
                  variant="outline"
                  className={`${meta?.color?.split(' ')[0] || ''} ${meta?.color?.split(' ')[1] || ''} border-current`}
                >
                  {meta?.label || node.type}
                </Badge>
                <span className="font-mono text-xs text-muted-foreground shrink-0">
                  {node.id.slice(0, 10)}
                </span>
                {label && (
                  <span className="text-muted-foreground truncate flex-1">{label}</span>
                )}
                <div className="flex gap-1 ml-auto shrink-0">
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEditDialog(index)}>
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => deleteNode(index)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingIndex !== null ? 'Edit Node' : 'Add Node'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Node ID</Label>
              <Input value={formData.id} disabled className="font-mono text-xs" />
            </div>
            <div className="space-y-2">
              <Label>Type</Label>
              <Select
                value={formData.type}
                onValueChange={(v) => setFormData((prev) => ({ ...prev, type: v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select node type" />
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
            <div className="space-y-2">
              <Label>Label (optional)</Label>
              <Input
                value={formData.label}
                onChange={(e) => setFormData((prev) => ({ ...prev, label: e.target.value }))}
                placeholder="e.g., Review Submission"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={saveNode} disabled={!formData.type}>
              {editingIndex !== null ? 'Save Changes' : 'Add Node'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
