import { describe, it, expect } from 'vitest';
import { JgfToGraphAdapter } from './JgfToGraphAdapter';
import type { JgfDocument } from './JgfGraphDocument';

const sampleJgf: JgfDocument = {
  graph: {
    id: 'test-graph',
    metadata: { author: 'Test', version: '1.0' },
    nodes: [
      { id: 'n1', metadata: { label: 'Node 1', type: 'device' } },
      { id: 'n2', metadata: { label: 'Node 2', type: 'device' } }
    ],
    edges: [
      { id: 'e1', source: 'n1', target: 'n2', metadata: { label: 'Edge', capacity: '10Gbps' } }
    ]
  }
};

describe('JgfToGraphAdapter', () => {
  it('converts JGF to IGraph', () => {
    const graph = JgfToGraphAdapter.toGraph(sampleJgf);
    expect(graph).toBeDefined();
    expect(graph.nodes.length).toBe(2);
    expect(graph.edges.length).toBe(1);
    expect(graph.nodes[0].id).toBe('n1');
    expect((graph.nodes[0].payload as any).label).toBe('Node 1');
    // Edges do not have id/payload, check source/target
    expect(graph.edges[0].source.id).toBe('n1');
    expect(graph.edges[0].target.id).toBe('n2');
    // Edge metadata is not stored in this model, so skip that check
  });
});
