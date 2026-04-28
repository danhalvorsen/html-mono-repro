
import type { JgfDocument } from './JgfGraphDocument';

export class JgfGraphParser {
  static parse(json: string): JgfDocument {
    const doc = JSON.parse(json);
    // Basic validation (expand as needed)
    if (!doc.graph || !Array.isArray(doc.graph.nodes) || !Array.isArray(doc.graph.edges)) {
      throw new Error('Invalid JGF: missing graph, nodes, or edges');
    }
    return doc;
  }
}
