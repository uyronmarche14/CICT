'use client';

import { useCallback, useMemo, useState, useRef, useEffect } from 'react';
import {
  ReactFlow,
  ReactFlowProvider,
  addEdge,
  applyNodeChanges,
  applyEdgeChanges,
  Controls,
  MiniMap,
  Background,
  BackgroundVariant,
  EdgeLabelRenderer,
  BaseEdge,
  getSmoothStepPath,
  type Connection,
  type Edge,
  type Node,
  type NodeTypes,
  type NodeChange,
  type EdgeChange,
  type EdgeProps,
  useReactFlow,
  MarkerType,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { StartNode } from './nodes/StartNode';
import { TaskNode } from './nodes/TaskNode';
import { ApprovalNode } from './nodes/ApprovalNode';
import { DocumentRequirementNode } from './nodes/DocumentRequirementNode';
import { CommentReviewNode } from './nodes/CommentReviewNode';
import { EndNode } from './nodes/EndNode';
import { ProcessFlowToolbar } from './ProcessFlowToolbar';
import { NodeInspectorPanel } from './NodeInspectorPanel';
import { EdgeInspectorPanel } from './EdgeInspectorPanel';
import { generateNodeId, generateEdgeId, recalculatePositions } from '@/utils/process-layout';
import type { ProcessNode, ProcessEdge, NodeAssignment } from '@/lib/api/process';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';

interface NodeDraft {
  label: string;
  type: string;
  data: Record<string, unknown>;
  assignees: Array<{ type: string; id: string; name?: string }>;
}

const nodeTypes: NodeTypes = {
  start: StartNode,
  task: TaskNode,
  approval: ApprovalNode,
  document_requirement: DocumentRequirementNode,
  comment_review: CommentReviewNode,
  end: EndNode,
};

const EDGE_STYLES: Record<string, { stroke: string; strokeWidth: number; strokeDasharray?: string; animated?: boolean }> = {
  normal: { stroke: '#94a3b8', strokeWidth: 2 },
  approval: { stroke: '#22c55e', strokeWidth: 2.5 },
  rejection: { stroke: '#ef4444', strokeWidth: 2, strokeDasharray: '6,3' },
  conditional: { stroke: '#f59e0b', strokeWidth: 2, strokeDasharray: '4,4' },
  animated: { stroke: '#3b82f6', strokeWidth: 2.5, animated: true },
};

const defaultEdgeOptions = {
  type: 'smoothstep',
  markerEnd: { type: MarkerType.ArrowClosed },
  style: { stroke: '#94a3b8', strokeWidth: 2 },
};

function getEdgeStyle(edgeData: Record<string, unknown>) {
  const styleName = String(edgeData?.style || 'normal');
  return EDGE_STYLES[styleName] || EDGE_STYLES.normal;
}

function LabeledEdge({
  id,
  source,
  target,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  selected,
}: EdgeProps) {
  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition,
  });

  const es = getEdgeStyle((data as Record<string, unknown>) || {});
  const label = (data as Record<string, unknown>)?.label as string || '';
  const style = {
    stroke: es.stroke,
    strokeWidth: es.strokeWidth,
    strokeDasharray: es.strokeDasharray,
  };

  return (
    <>
      <BaseEdge id={id} path={edgePath} style={style} />
      {label && (
        <EdgeLabelRenderer>
          <div
            className="absolute px-2 py-0.5 rounded text-[10px] font-medium bg-background border shadow-sm pointer-events-none"
            style={{
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              color: es.stroke,
              borderColor: es.stroke,
            }}
          >
            {label}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
}

const edgeTypes = {
  smoothstep: LabeledEdge,
  default: LabeledEdge,
};

export interface InstanceModeConfig {
  isActive: (nodeId: string) => boolean;
  isCompleted: (nodeId: string) => boolean;
  approvalStatus: (nodeId: string) => string | null;
  currentNodeIds: string[];
  onToggleComplete?: (nodeId: string) => void;
  onApprove?: (nodeId: string) => void;
  onReject?: (nodeId: string) => void;
  onChecklistToggle?: (nodeId: string, itemId: string, completed: boolean) => void;
}

interface ProcessFlowCanvasProps {
  initialNodes: ProcessNode[];
  initialEdges: ProcessEdge[];
  initialAssignments: NodeAssignment[];
  onChange: (nodes: ProcessNode[], edges: ProcessEdge[], assignments: NodeAssignment[]) => void;
  instanceMode?: InstanceModeConfig;
}

function Flow({ initialNodes, initialEdges, initialAssignments, onChange, instanceMode }: ProcessFlowCanvasProps) {
  const [nodes, setNodes] = useState<Node[]>(() =>
    initialNodes.map((n) => ({ ...n, data: { ...n.data } } as Node))
  );
  const [edges, setEdges] = useState<Edge[]>(() =>
    initialEdges.map((e) => ({ ...e, data: e.data || {} }) as Edge)
  );
  const [assignments, setAssignments] = useState<NodeAssignment[]>(initialAssignments);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);
  const [inspectorMode, setInspectorMode] = useState<'node' | 'edge'>('node');
  const [sheetOpen, setSheetOpen] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const nodesRef = useRef(nodes);
  const edgesRef = useRef(edges);
  const assignmentsRef = useRef(assignments);
  const sheetDirtyRef = useRef(false);

  const handleSheetDirtyChange = useCallback((dirty: boolean) => {
    sheetDirtyRef.current = dirty;
  }, []);

  const closeSheet = useCallback(() => {
    if (sheetDirtyRef.current) {
      const confirmed = window.confirm('You have unsaved changes. Discard them?');
      if (!confirmed) return;
    }
    setSheetOpen(false);
    setSelectedNodeId(null);
    setSelectedEdgeId(null);
    sheetDirtyRef.current = false;
  }, []);

  const actionCallbacksRef = useRef({
    onToggleComplete: (_nodeId: string) => {},
    onApprove: (_nodeId: string) => {},
    onReject: (_nodeId: string) => {},
  });
  const { screenToFlowPosition } = useReactFlow();

  const injectCallbacks = useCallback((nds: Node[]) =>
    nds.map((n) => ({
      ...n,
      data: {
        ...n.data,
        onToggleComplete: instanceMode?.onToggleComplete || actionCallbacksRef.current.onToggleComplete,
        onApprove: instanceMode?.onApprove || actionCallbacksRef.current.onApprove,
        onReject: instanceMode?.onReject || actionCallbacksRef.current.onReject,
        onChecklistToggle: instanceMode?.onChecklistToggle,
        _instanceActive: instanceMode?.isActive(n.id) ?? false,
        _instanceCompleted: instanceMode?.isCompleted(n.id) ?? false,
        _instanceApprovalStatus: instanceMode?.approvalStatus(n.id) ?? null,
        _instanceMode: !!instanceMode,
      },
    })),
  [instanceMode]);

  useEffect(() => {
    const syncedNodes = injectCallbacks(initialNodes.map((n) => ({ ...n, data: { ...n.data } } as Node)));
    setNodes(syncedNodes);
    nodesRef.current = syncedNodes;
  }, [initialNodes, injectCallbacks]);

  useEffect(() => {
    const syncedEdges = initialEdges.map((e) => {
      const edgeData = e.data || {};
      const baseEdge = { ...e, data: edgeData } as Edge;
      const es = getEdgeStyle(edgeData);
      baseEdge.style = { stroke: es.stroke, strokeWidth: es.strokeWidth };
      if (es.strokeDasharray) baseEdge.style.strokeDasharray = es.strokeDasharray;
      if (es.animated) (baseEdge as Record<string, unknown>).animated = true;
      return baseEdge;
    }) as Edge[];
    setEdges(syncedEdges);
    edgesRef.current = syncedEdges;
  }, [initialEdges]);

  useEffect(() => {
    setAssignments(initialAssignments);
    assignmentsRef.current = initialAssignments;
  }, [initialAssignments]);

  useEffect(() => { nodesRef.current = nodes; }, [nodes]);
  useEffect(() => { edgesRef.current = edges; }, [edges]);
  useEffect(() => { assignmentsRef.current = assignments; }, [assignments]);

  const selectedNode = useMemo(
    () => nodes.find((n) => n.id === selectedNodeId) || null,
    [nodes, selectedNodeId]
  );

  const selectedEdge = useMemo(
    () => edges.find((e) => e.id === selectedEdgeId) || null,
    [edges, selectedEdgeId]
  );

  const nodeAssignees = useMemo(() => {
    if (!selectedNodeId) return [];
    return assignments
      .filter((a) => a.nodeId === selectedNodeId)
      .map((a) => ({ type: a.assigneeType, id: a.assigneeId, name: '' }));
  }, [assignments, selectedNodeId]);

  const allNodeIds = useMemo(() => nodes.map((n) => n.id), [nodes]);

  const emitChange = useCallback(
    (nds: Node[], eds: Edge[], asgns: NodeAssignment[]) => {
      const pNodes: ProcessNode[] = nds.map((n) => ({
        id: n.id,
        type: n.type || 'task',
        position: n.position,
        data: n.data || {},
      })) as ProcessNode[];
      const pEdges: ProcessEdge[] = eds.map((e) => ({
        id: e.id,
        source: e.source,
        target: e.target,
        label: String(e.label || e.data?.label || ''),
        data: { ...(e.data || {}), style: (e.data?.style as string) || 'normal' },
      }));
      onChange(pNodes, pEdges, asgns);
    },
    [onChange]
  );

  useEffect(() => {
    actionCallbacksRef.current = {
      onToggleComplete: (nodeId: string) => {
        setNodes((nds) => {
          const updated = nds.map((n) =>
            n.id === nodeId ? { ...n, data: { ...n.data, completed: !n.data.completed } } : n
          );
          nodesRef.current = updated;
          emitChange(updated, edgesRef.current, assignmentsRef.current);
          return updated;
        });
      },
      onApprove: (nodeId: string) => {
        setNodes((nds) => {
          const updated = nds.map((n) =>
            n.id === nodeId ? { ...n, data: { ...n.data, status: 'approved' } } : n
          );
          nodesRef.current = updated;
          emitChange(updated, edgesRef.current, assignmentsRef.current);
          return updated;
        });
      },
      onReject: (nodeId: string) => {
        setNodes((nds) => {
          const updated = nds.map((n) =>
            n.id === nodeId ? { ...n, data: { ...n.data, status: 'rejected' } } : n
          );
          nodesRef.current = updated;
          emitChange(updated, edgesRef.current, assignmentsRef.current);
          return updated;
        });
      },
    };
  });

  const handleNodesChange = useCallback(
    (changes: NodeChange[]) => {
      setNodes((nds) => {
        const updated = applyNodeChanges(changes, nds);
        nodesRef.current = updated;
        return updated;
      });
    },
    []
  );

  const handleEdgesChange = useCallback(
    (changes: EdgeChange[]) => {
      setEdges((eds) => {
        const updated = applyEdgeChanges(changes, eds);
        edgesRef.current = updated;
        return updated;
      });
    },
    []
  );

  const onConnect = useCallback(
    (connection: Connection) => {
      const newEdge = {
        ...connection,
        id: generateEdgeId(),
        label: '',
        data: { style: 'normal' },
      } as Edge;
      const edgeStyle = getEdgeStyle(newEdge.data || {});
      newEdge.style = { stroke: edgeStyle.stroke, strokeWidth: edgeStyle.strokeWidth };
      if (edgeStyle.strokeDasharray) newEdge.style.strokeDasharray = edgeStyle.strokeDasharray;
      if (edgeStyle.animated) (newEdge as Record<string, unknown>).animated = true;
      setEdges((eds) => {
        const updated = addEdge(newEdge, eds);
        edgesRef.current = updated;
        emitChange(nodesRef.current, updated, assignmentsRef.current);
        return updated;
      });
    },
    [emitChange]
  );

  const openNodeInspector = useCallback((_event: React.MouseEvent, node: Node) => {
    setSelectedNodeId(node.id);
    setSelectedEdgeId(null);
    setInspectorMode('node');
    setSheetOpen(true);
  }, []);

  const openEdgeInspector = useCallback((_event: React.MouseEvent, edge: Edge) => {
    setSelectedEdgeId(edge.id);
    setSelectedNodeId(null);
    setInspectorMode('edge');
    setSheetOpen(true);
  }, []);

  const handleAddNode = useCallback(
    (type: string) => {
      const id = generateNodeId();
      const pos = screenToFlowPosition({ x: 200 + Math.random() * 200, y: 200 + Math.random() * 200 });
      const newNode: Node = {
        id,
        type,
        position: pos,
        data: { label: '' },
      };
      setNodes((nds) => {
        const updated = injectCallbacks([...nds, newNode]);
        const raw = updated.map((n) => ({ id: n.id, type: n.type || 'task', position: n.position }));
        const positions = recalculatePositions(raw);
        const positioned = updated.map((n, i) => ({
          ...n,
          position: { x: positions[i]?.x ?? n.position.x, y: positions[i]?.y ?? n.position.y },
        }));
        nodesRef.current = positioned;
        emitChange(positioned, edgesRef.current, assignmentsRef.current);
        return positioned;
      });
      setSelectedNodeId(id);
      setInspectorMode('node');
      setSheetOpen(true);
    },
    [emitChange, screenToFlowPosition]
  );

  const handleAutoLayout = useCallback(() => {
    setNodes((nds) => {
      const raw = nds.map((n) => ({ id: n.id, type: n.type || 'task', position: n.position }));
      const positions = recalculatePositions(raw);
      const updated = nds.map((n, i) => ({
        ...n,
        position: { x: positions[i]?.x ?? n.position.x, y: positions[i]?.y ?? n.position.y },
      }));
      nodesRef.current = updated;
      emitChange(updated, edgesRef.current, assignmentsRef.current);
      return updated;
    });
  }, [emitChange]);

  const handleDeleteSelected = useCallback(() => {
    if (selectedNodeId) {
      setNodes((nds) => {
        const updated = nds.filter((n) => n.id !== selectedNodeId);
        setEdges((eds) => {
          const updatedEdges = eds.filter(
            (e) => e.source !== selectedNodeId && e.target !== selectedNodeId
          );
          const updatedAssignments = assignmentsRef.current.filter((a) => a.nodeId !== selectedNodeId);
          setAssignments(updatedAssignments);
          edgesRef.current = updatedEdges;
          assignmentsRef.current = updatedAssignments;
          emitChange(updated, updatedEdges, updatedAssignments);
          return updatedEdges;
        });
        nodesRef.current = updated;
        return updated;
      });
      setSelectedNodeId(null);
      setSheetOpen(false);
    }
    if (selectedEdgeId) {
      setEdges((eds) => {
        const updated = eds.filter((e) => e.id !== selectedEdgeId);
        edgesRef.current = updated;
        emitChange(nodesRef.current, updated, assignmentsRef.current);
        return updated;
      });
      setSelectedEdgeId(null);
      setSheetOpen(false);
    }
  }, [selectedNodeId, selectedEdgeId, emitChange]);

  const handleSaveNode = useCallback(
    (id: string, draft: NodeDraft) => {
      const updatedAssignments: NodeAssignment[] = [
        ...assignmentsRef.current.filter((a) => a.nodeId !== id),
        ...draft.assignees.map((a) => ({
          nodeId: id,
          assigneeType: a.type as 'user' | 'role' | 'organization',
          assigneeId: a.id,
        })),
      ];
      setAssignments(updatedAssignments);
      assignmentsRef.current = updatedAssignments;
      setNodes((nds) => {
        const withChanges = nds.map((n) =>
          n.id === id
            ? { ...n, type: draft.type, data: { ...n.data, ...draft.data, label: draft.label, assignees: draft.assignees } }
            : n
        );
        const updated = injectCallbacks(withChanges);
        nodesRef.current = updated;
        emitChange(updated, edgesRef.current, updatedAssignments);
        return updated;
      });
      setSheetOpen(false);
    },
    [emitChange]
  );

  const handleCancelNode = useCallback(() => {
    setSheetOpen(false);
    setSelectedNodeId(null);
  }, []);

  const handleSaveEdge = useCallback(
    (label: string, styleName: string) => {
      if (!selectedEdgeId) return;
      setEdges((eds) => {
        const updated = eds.map((e) => {
          if (e.id !== selectedEdgeId) return e;
          const es = getEdgeStyle({ ...e.data, style: styleName });
          const style = { stroke: es.stroke, strokeWidth: es.strokeWidth } as Record<string, unknown>;
          if (es.strokeDasharray) style.strokeDasharray = es.strokeDasharray;
          const updatedEdge = {
            ...e, label, data: { ...e.data, label, style: styleName },
            style,
          } as Edge;
          if (es.animated) (updatedEdge as Record<string, unknown>).animated = true;
          return updatedEdge;
        });
        edgesRef.current = updated;
        emitChange(nodesRef.current, updated, assignmentsRef.current);
        return updated;
      });
      setSheetOpen(false);
    },
    [selectedEdgeId, emitChange]
  );

  const handleCancelEdge = useCallback(() => {
    setSheetOpen(false);
    setSelectedEdgeId(null);
  }, []);

  const handleDeleteEdge = useCallback(() => {
    if (!selectedEdgeId) return;
    setEdges((eds) => {
      const updated = eds.filter((e) => e.id !== selectedEdgeId);
      edgesRef.current = updated;
      emitChange(nodesRef.current, updated, assignmentsRef.current);
      return updated;
    });
    setSelectedEdgeId(null);
    setSheetOpen(false);
  }, [selectedEdgeId, emitChange]);

  const toggleFullscreen = useCallback(() => {
    setFullscreen((f) => !f);
    setTimeout(() => window.dispatchEvent(new Event('resize')), 100);
  }, []);

  const sheetTitle = inspectorMode === 'node'
    ? `Node: ${selectedNode?.data?.label || selectedNodeId || ''}`
    : `Connection: ${selectedEdgeId || ''}`;

  const canvasClasses = fullscreen
    ? 'fixed inset-4 z-50 bg-background shadow-2xl flex flex-col border rounded-lg overflow-hidden'
    : 'flex flex-col border rounded-lg overflow-hidden flex-1 min-h-0';

  return (
    <div className={canvasClasses}>
      <ProcessFlowToolbar
        selectedNodeId={selectedNodeId}
        onAddNode={instanceMode ? undefined : handleAddNode}
        onAutoLayout={instanceMode ? undefined : handleAutoLayout}
        onDeleteSelected={instanceMode ? undefined : handleDeleteSelected}
        onFullscreen={toggleFullscreen}
        isFullscreen={fullscreen}
        isInstanceMode={!!instanceMode}
      />
      <div className="flex-1 min-h-0">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={handleNodesChange}
          onEdgesChange={instanceMode ? undefined : handleEdgesChange}
          onConnect={instanceMode ? undefined : onConnect}
          onNodeClick={openNodeInspector}
          onEdgeClick={instanceMode ? undefined : openEdgeInspector}
          onPaneClick={() => { setSelectedNodeId(null); setSelectedEdgeId(null); setSheetOpen(false); }}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          defaultEdgeOptions={defaultEdgeOptions}
          fitView
          snapToGrid
          snapGrid={[20, 20]}
          panOnDrag={[1, 2]}
          selectionOnDrag
          panOnScroll={false}
          zoomOnScroll={false}
          nodesDraggable={!instanceMode}
          deleteKeyCode={instanceMode ? [] : ['Backspace', 'Delete']}
          onDelete={instanceMode ? undefined : handleDeleteSelected}
          minZoom={0.1}
          maxZoom={4}
          attributionPosition="bottom-right"
        >
          <Controls position="bottom-right" showInteractive={false} />
          <MiniMap
            position="bottom-left"
            pannable
            zoomable
            nodeStrokeColor="#94a3b8"
            nodeColor={(n) => {
              const colors: Record<string, string> = {
                start: '#bbf7d0', task: '#bfdbfe', approval: '#fde68a',
                document_requirement: '#e9d5ff', comment_review: '#c7d2fe', end: '#e2e8f0',
              };
              return colors[n.type || 'task'] || '#e2e8f0';
            }}
            maskColor="rgba(0,0,0,0.08)"
            style={{ border: '1px solid #e2e8f0', borderRadius: '8px' }}
          />
          <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="#e2e8f0" />
        </ReactFlow>
      </div>

      <Sheet open={sheetOpen} onOpenChange={(open) => { if (!open) closeSheet(); }}>
        <SheetContent side="right" className="w-[420px] sm:w-[480px] overflow-y-auto" aria-describedby={undefined}>
          <SheetHeader>
            <SheetTitle className="text-sm">{sheetTitle}</SheetTitle>
          </SheetHeader>
          <div className="mt-5">
            {inspectorMode === 'node' ? (
              <NodeInspectorPanel
                nodeId={selectedNodeId}
                nodeType={selectedNode?.type || null}
                nodeLabel={String(selectedNode?.data?.label || '')}
                nodeData={selectedNode?.data || {}}
                assignees={nodeAssignees}
                allNodeIds={allNodeIds}
                onSave={handleSaveNode}
                onCancel={handleCancelNode}
                onDirtyChange={handleSheetDirtyChange}
              />
            ) : (
              <EdgeInspectorPanel
                edgeId={selectedEdgeId}
                edgeLabel={String(selectedEdge?.data?.label || selectedEdge?.label || '')}
                edgeSource={selectedEdge?.source || ''}
                edgeTarget={selectedEdge?.target || ''}
                edgeStyle={String(selectedEdge?.data?.style || 'normal')}
                onSave={handleSaveEdge}
                onCancel={handleCancelEdge}
                onDelete={handleDeleteEdge}
                onDirtyChange={handleSheetDirtyChange}
              />
            )}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

export function ProcessFlowCanvas(props: ProcessFlowCanvasProps) {
  return (
    <ReactFlowProvider>
      <Flow {...props} />
    </ReactFlowProvider>
  );
}
