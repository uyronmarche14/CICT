import type { ProcessNodeType } from '@/types';

const NODE_WIDTH = 240;
const NODE_HEIGHT = 110;
const X_GAP = 80;
const Y_GAP = 100;

export const NODE_TYPE_META: Record<string, { label: string; color: string; band: number }> = {
  start: { label: 'Start', color: 'bg-green-100 border-green-400 text-green-800', band: 0 },
  task: { label: 'Task', color: 'bg-blue-100 border-blue-400 text-blue-800', band: 1 },
  approval: { label: 'Approval', color: 'bg-amber-100 border-amber-400 text-amber-800', band: 2 },
  document_requirement: { label: 'Document', color: 'bg-purple-100 border-purple-400 text-purple-800', band: 3 },
  comment_review: { label: 'Review', color: 'bg-indigo-100 border-indigo-400 text-indigo-800', band: 4 },
  end: { label: 'End', color: 'bg-slate-100 border-slate-400 text-slate-800', band: 5 },
};

let _counter = 0;

export function generateNodeId(): string {
  _counter += 1;
  return `n-${Date.now().toString(36)}-${_counter}`;
}

export function generateEdgeId(): string {
  return `e-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

export function autoLayoutNodes(
  nodes: { type: string; position?: { x: number; y: number } }[]
): { x: number; y: number }[] {
  const bands: Record<number, number> = {};

  return nodes.map((node) => {
    const meta = NODE_TYPE_META[node.type];
    const band = meta?.band ?? 1;
    const countInBand = bands[band] ?? 0;
    bands[band] = countInBand + 1;

    const x = 40 + countInBand * (NODE_WIDTH + X_GAP);
    const y = 20 + band * (NODE_HEIGHT + Y_GAP);

    return { x, y };
  });
}

export function recalculatePositions(
  nodes: { id: string; type: string; position?: { x: number; y: number } }[]
): Array<{ id: string; x: number; y: number }> {
  const positions = autoLayoutNodes(nodes);
  return nodes.map((node, i) => ({
    id: node.id,
    x: positions[i]?.x ?? 0,
    y: positions[i]?.y ?? 0,
  }));
}

export function validateEdge(
  nodes: Array<{ id: string }>,
  source: string,
  target: string,
  existingEdges: Array<{ source: string; target: string }>,
  editingEdgeId?: string
): { valid: boolean; error?: string } {
  if (!source || !target) {
    return { valid: false, error: 'Source and target are required' };
  }

  if (source === target) {
    return { valid: false, error: 'Cannot connect a node to itself' };
  }

  const sourceExists = nodes.some((n) => n.id === source);
  const targetExists = nodes.some((n) => n.id === target);

  if (!sourceExists) {
    return { valid: false, error: 'Source node does not exist' };
  }

  if (!targetExists) {
    return { valid: false, error: 'Target node does not exist' };
  }

  const duplicate = existingEdges.find(
    (e) =>
      e.source === source &&
      e.target === target &&
      e !== existingEdges.find((_, i) => i === -1) &&
      (editingEdgeId ? e.source !== editingEdgeId || e.target !== editingEdgeId : true)
  );

  if (duplicate) {
    return { valid: false, error: 'This connection already exists' };
  }

  return { valid: true };
}

export function getNodeById(nodes: Array<{ id: string }>, id: string) {
  return nodes.find((n) => n.id === id);
}

export function getNodeLabel(node: { id: string; type: string; data?: Record<string, unknown> }): string {
  const label = node.data?.label as string | undefined;
  const meta = NODE_TYPE_META[node.type];
  return label || `${meta?.label ?? node.type} (${node.id.slice(0, 8)})`;
}
