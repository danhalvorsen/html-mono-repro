import type { JgfDocument } from './JgfGraphDocument';
import type { IGraph } from '@monorepo/core-graph';
import { Graph } from '@monorepo/core-graph';

export class JgfToGraphAdapter {
  static toGraph(doc: JgfDocument): IGraph {
    const graph = new Graph();
    // Add nodes
    const nodeMap = new Map<string, { id: string; payload: unknown }>();
    for (const n of doc.graph.nodes) {
      const node = graph.addNode(n.id, n.metadata || {});
      nodeMap.set(n.id, node);
    }
    // Add edges
    for (const e of doc.graph.edges) {
      const source = nodeMap.get(e.source);
      const target = nodeMap.get(e.target);
      if (source && target) {
        graph.addEdge(source, target);
      }
    }
    return graph;
  }
}
