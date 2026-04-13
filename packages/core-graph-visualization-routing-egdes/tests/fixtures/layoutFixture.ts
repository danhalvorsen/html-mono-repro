import type { IEdge, IGraph, IGraphNode } from "@monorepo/core-graph";

export const canvas = { width: 900, height: 640, padding: 48 };
export const box = { width: 120, height: 60 };

export function buildGraph(nodeCount: number, edges: [number, number][] = []): IGraph {
  const nodes: IGraphNode[] = Array.from({ length: nodeCount }, (_, i) => ({ id: `node-${i}`, payload: null }));
  const graphEdges: IEdge[] = edges.map(([sourceIndex, targetIndex]) => ({
    source: nodes[sourceIndex]!,
    target: nodes[targetIndex]!,
  }));

  return {
    get nodes(): readonly IGraphNode[] {
      return nodes;
    },
    get edges(): readonly IEdge[] {
      return graphEdges;
    },
    addNode(id: string, payload?: unknown): IGraphNode {
      const node: IGraphNode = { id, payload: payload ?? undefined };
      nodes.push(node);
      return node;
    },
    addEdge(source: IGraphNode, target: IGraphNode): IEdge {
      const edge: IEdge = { source, target };
      graphEdges.push(edge);
      return edge;
    },
  };
}
