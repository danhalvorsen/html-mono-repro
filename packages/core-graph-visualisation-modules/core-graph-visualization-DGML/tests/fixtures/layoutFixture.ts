export const canvas = { width: 900, height: 640, padding: 48 };
export const box = { width: 120, height: 60 };

export function buildGraph(nodeCount: number, edges: [number, number][] = []) {
  const nodes = Array.from({ length: nodeCount }, (_, i) => ({ id: `node-${i}`, payload: null }));
  const graphEdges = edges.map(([sourceIndex, targetIndex]) => ({
    source: nodes[sourceIndex]!,
    target: nodes[targetIndex]!,
  }));

  return {
    nodes,
    edges: graphEdges,
  };
}
