import type { GraphJsonDocument } from "./GraphJsonDocument.js";

export class GraphJsonValidator {
  validate(document: GraphJsonDocument): void {
    if (!Array.isArray(document.nodes)) {
      throw new Error("GraphJsonDocument.nodes must be an array");
    }

    if (!Array.isArray(document.edges)) {
      throw new Error("GraphJsonDocument.edges must be an array");
    }

    const nodeIds = new Set<string>();

    for (const node of document.nodes) {
      if (typeof node.id !== "string" || node.id.trim() === "") {
        throw new Error("Each node must have a non-empty string id");
      }

      if (nodeIds.has(node.id)) {
        throw new Error(`Duplicate node id: ${node.id}`);
      }

      nodeIds.add(node.id);
    }

    for (const edge of document.edges) {
      if (typeof edge.sourceId !== "string" || edge.sourceId.trim() === "") {
        throw new Error("Each edge must have a non-empty sourceId");
      }

      if (typeof edge.targetId !== "string" || edge.targetId.trim() === "") {
        throw new Error("Each edge must have a non-empty targetId");
      }

      if (!nodeIds.has(edge.sourceId)) {
        throw new Error(`Edge source '${edge.sourceId}' does not exist`);
      }

      if (!nodeIds.has(edge.targetId)) {
        throw new Error(`Edge target '${edge.targetId}' does not exist`);
      }
    }
  }
}
