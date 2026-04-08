export const canvas = { width: 800, height: 600, padding: 48 };
export const box = { width: 112, height: 56 };

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
