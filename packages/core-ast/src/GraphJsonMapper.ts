import type { IGraph, IGraphNode } from "@monorepo/core-graph";
import type { GraphJsonDocument } from "./GraphJsonDocument.js";

export class GraphJsonMapper {
  toDocument(graph: IGraph): GraphJsonDocument {
    return {
      nodes: graph.nodes.map((node) => ({
        id: node.id,
        payload: node.payload,
      })),
      edges: graph.edges.map((edge) => ({
        sourceId: edge.source.id,
        targetId: edge.target.id,
      })),
    };
  }

  fromDocument(document: GraphJsonDocument, graph: IGraph): IGraph {
    const nodeById = new Map<string, IGraphNode>();

    for (const node of document.nodes) {
      const createdNode = graph.addNode(node.id, node.payload);
      nodeById.set(createdNode.id, createdNode);
    }

    for (const edge of document.edges) {
      const source = nodeById.get(edge.sourceId);
      const target = nodeById.get(edge.targetId);

      if (source === undefined || target === undefined) {
        throw new Error(`Cannot create edge '${edge.sourceId}' -> '${edge.targetId}' because one or both nodes are missing`);
      }

      graph.addEdge(source, target);
    }

    return graph;
  }
}
