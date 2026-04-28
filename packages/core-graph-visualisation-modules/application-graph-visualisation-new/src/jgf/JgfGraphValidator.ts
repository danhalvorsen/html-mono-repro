
import type { JgfDocument } from './JgfGraphDocument';

export class JgfGraphValidator {
  static validate(doc: JgfDocument): boolean {
    // Check for unique node ids
    const nodeIds = new Set();
    for (const node of doc.graph.nodes) {
      if (nodeIds.has(node.id)) return false;
      nodeIds.add(node.id);
    }
    // Check that all edge sources/targets exist
    const validIds = new Set(doc.graph.nodes.map(n => n.id));
    for (const edge of doc.graph.edges) {
      if (!validIds.has(edge.source) || !validIds.has(edge.target)) return false;
    }
    return true;
  }
}
