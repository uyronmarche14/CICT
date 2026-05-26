import { describe, expect, it } from 'vitest';
import {
  canTransition,
  findStartNodes,
  findEndNodes,
  getNextNodes,
} from './process-engine.service';
import { IProcessNode } from '../types';

const makeNode = (id: string, type: IProcessNode['type']): IProcessNode => ({
  id,
  type,
  position: { x: 0, y: 0 },
  data: {},
});

const makeEdge = (id: string, source: string, target: string) => ({
  id,
  source,
  target,
});

describe('canTransition', () => {
  it('allows draft -> active', () => {
    expect(canTransition('draft', 'active')).toBe(true);
  });

  it('allows active -> completed', () => {
    expect(canTransition('active', 'completed')).toBe(true);
  });

  it('allows active -> archived', () => {
    expect(canTransition('active', 'archived')).toBe(true);
  });

  it('allows completed -> archived', () => {
    expect(canTransition('completed', 'archived')).toBe(true);
  });

  it('denies draft -> completed', () => {
    expect(canTransition('draft', 'completed')).toBe(false);
  });

  it('denies draft -> archived', () => {
    expect(canTransition('draft', 'archived')).toBe(false);
  });

  it('denies archived -> any', () => {
    expect(canTransition('archived', 'draft')).toBe(false);
    expect(canTransition('archived', 'active')).toBe(false);
    expect(canTransition('archived', 'completed')).toBe(false);
  });

  it('denies unknown status', () => {
    expect(canTransition('unknown', 'active')).toBe(false);
  });
});

describe('findStartNodes', () => {
  it('returns start node ids', () => {
    const nodes = [makeNode('s1', 'start'), makeNode('t1', 'task'), makeNode('e1', 'end')];
    expect(findStartNodes(nodes)).toEqual(['s1']);
  });

  it('returns multiple start nodes', () => {
    const nodes = [makeNode('s1', 'start'), makeNode('s2', 'start'), makeNode('t1', 'task')];
    expect(findStartNodes(nodes)).toEqual(['s1', 's2']);
  });

  it('returns empty array when no start nodes', () => {
    const nodes = [makeNode('t1', 'task'), makeNode('e1', 'end')];
    expect(findStartNodes(nodes)).toEqual([]);
  });

  it('returns empty array for empty input', () => {
    expect(findStartNodes([])).toEqual([]);
  });
});

describe('findEndNodes', () => {
  it('returns end node ids', () => {
    const nodes = [makeNode('s1', 'start'), makeNode('t1', 'task'), makeNode('e1', 'end')];
    expect(findEndNodes(nodes)).toEqual(['e1']);
  });

  it('returns empty array when no end nodes', () => {
    const nodes = [makeNode('s1', 'start'), makeNode('t1', 'task')];
    expect(findEndNodes(nodes)).toEqual([]);
  });
});

describe('getNextNodes', () => {
  it('returns targets of outgoing edges from current nodes', () => {
    const edges = [makeEdge('e1', 's1', 't1'), makeEdge('e2', 't1', 'e1')];
    expect(getNextNodes(['s1'], edges)).toEqual(['t1']);
  });

  it('returns unique target ids for multiple current nodes', () => {
    const edges = [
      makeEdge('e1', 's1', 't1'),
      makeEdge('e2', 's2', 't1'),
    ];
    expect(getNextNodes(['s1', 's2'], edges)).toEqual(['t1']);
  });

  it('returns empty array when no outgoing edges', () => {
    const edges = [makeEdge('e1', 's1', 't1')];
    expect(getNextNodes(['t1'], edges)).toEqual([]);
  });

  it('returns empty array for empty inputs', () => {
    expect(getNextNodes([], [])).toEqual([]);
  });
});
