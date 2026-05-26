'use client';

import { useState, useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Plus, Trash2, Link2 } from 'lucide-react';
import { generateEdgeId, validateEdge, getNodeLabel } from '@/utils/process-layout';
import type { ProcessNode, ProcessEdge } from '@/lib/api/process';

interface ProcessEdgeEditorProps {
  nodes: ProcessNode[];
  edges: ProcessEdge[];
  onChange: (edges: ProcessEdge[]) => void;
}

export function ProcessEdgeEditor({ nodes, edges, onChange }: ProcessEdgeEditorProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newSource, setNewSource] = useState('');
  const [newTarget, setNewTarget] = useState('');
  const [newLabel, setNewLabel] = useState('');

  const validationError = useMemo(() => {
    if (!showAddForm) return undefined;
    const result = validateEdge(nodes, newSource, newTarget, edges);
    return result.valid ? undefined : result.error;
  }, [showAddForm, newSource, newTarget, edges, nodes]);

  const resetForm = useCallback(() => {
    setNewSource('');
    setNewTarget('');
    setNewLabel('');
    setShowAddForm(false);
  }, []);

  const addEdge = useCallback(() => {
    const result = validateEdge(nodes, newSource, newTarget, edges);
    if (!result.valid) return;

    const newEdge: ProcessEdge = {
      id: generateEdgeId(),
      source: newSource,
      target: newTarget,
      label: newLabel || undefined,
    };

    onChange([...edges, newEdge]);
    resetForm();
  }, [newSource, newTarget, newLabel, nodes, edges, onChange, resetForm]);

  const deleteEdge = useCallback((index: number) => {
    onChange(edges.filter((_, i) => i !== index));
  }, [edges, onChange]);

  if (nodes.length < 2) {
    return (
      <div className="space-y-3">
        <p className="text-sm font-medium">Connections (Edges)</p>
        <div className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground text-center">
          Add at least 2 nodes before creating connections.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium">Connections (Edges)</p>
        {!showAddForm && (
          <Button size="sm" variant="outline" onClick={() => setShowAddForm(true)}>
            <Plus className="mr-1 h-4 w-4" /> Add Connection
          </Button>
        )}
      </div>

      {showAddForm && (
        <div className="rounded-lg border p-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>From (Source)</Label>
              <Select value={newSource} onValueChange={setNewSource}>
                <SelectTrigger>
                  <SelectValue placeholder="Select source..." />
                </SelectTrigger>
                <SelectContent>
                  {nodes.map((node) => (
                    <SelectItem key={node.id} value={node.id}>
                      {getNodeLabel(node)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>To (Target)</Label>
              <Select value={newTarget} onValueChange={setNewTarget}>
                <SelectTrigger>
                  <SelectValue placeholder="Select target..." />
                </SelectTrigger>
                <SelectContent>
                  {nodes.map((node) => (
                    <SelectItem key={node.id} value={node.id}>
                      {getNodeLabel(node)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Label (optional)</Label>
            <Input
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
              placeholder="e.g., Approved, Submit for review"
            />
          </div>
          {validationError && (
            <p className="text-sm text-destructive">{validationError}</p>
          )}
          <div className="flex gap-2">
            <Button size="sm" onClick={addEdge} disabled={!newSource || !newTarget || !!validationError}>
              Add
            </Button>
            <Button size="sm" variant="outline" onClick={resetForm}>
              Cancel
            </Button>
          </div>
        </div>
      )}

      {edges.length === 0 && !showAddForm ? (
        <div className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground text-center">
          No connections yet. Connect nodes to define the workflow path.
        </div>
      ) : (
        <div className="space-y-2">
          {edges.map((edge, index) => {
            const sourceNode = nodes.find((n) => n.id === edge.source);
            const targetNode = nodes.find((n) => n.id === edge.target);
            return (
              <div
                key={edge.id}
                className="flex items-center gap-3 rounded-lg border p-3 text-sm"
              >
                <Link2 className="h-4 w-4 text-muted-foreground shrink-0" />
                <span className="font-medium truncate">
                  {getNodeLabel(sourceNode ?? { id: edge.source, type: 'task' })}
                </span>
                <span className="text-muted-foreground shrink-0">&rarr;</span>
                <span className="font-medium truncate">
                  {getNodeLabel(targetNode ?? { id: edge.target, type: 'task' })}
                </span>
                {edge.label && (
                  <Badge variant="outline" className="text-xs shrink-0">
                    {edge.label}
                  </Badge>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-destructive ml-auto shrink-0"
                  onClick={() => deleteEdge(index)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
