import { IDagGraph } from "./DagGraph.js";

export class CycleDetector {
  static containsCycle(graph: IDagGraph): boolean {
    const visited = new Set<string>();
    const stack = new Set<string>();

    const adj = new Map<string, string[]>();
    for (const e of graph.edges) {
      if (!adj.has(e.source.id)) adj.set(e.source.id, []);
      adj.get(e.source.id)!.push(e.target.id);
    }

    const visit = (node: string): boolean => {
      if (stack.has(node)) return true;
      if (visited.has(node)) return false;

      visited.add(node);
      stack.add(node);

      for (const next of adj.get(node) ?? []) {
        if (visit(next)) return true;
      }

      stack.delete(node);
      return false;
    };

    for (const n of graph.nodes) {
      if (visit(n.id)) return true;
    }

    return false;
  }
}
