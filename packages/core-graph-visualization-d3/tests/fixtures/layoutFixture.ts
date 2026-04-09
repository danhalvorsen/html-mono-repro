export const canvas = { width: 800, height: 600, padding: 48 };
export const box = { width: 112, height: 56 };

export function buildGraph(nodeCount: number, edges: [number, number][] = []) {
  const nodes = Array.from({ length: nodeCount }, (_, i) => ({ id: `node-${i}`, payload: null as unknown }));
  const graphEdges = edges.map(([sourceIndex, targetIndex]) => ({
    source: nodes[sourceIndex]!,
    target: nodes[targetIndex]!,
  }));

  const addNode = (id: string, payload: unknown = null) => {
    const node = { id, payload };
    nodes.push(node);
    return node;
  };

  const addEdge = (source: (typeof nodes)[number], target: (typeof nodes)[number]) => {
    const edge = { source, target };
    graphEdges.push(edge);
    return edge;
  };

  return {
    nodes,
    edges: graphEdges,
    addNode,
    addEdge,
    addEdget: addEdge,
    addEdgets: addEdge,
  };
}
