import type { GraphEdgeRouteConstraint, GraphLayoutRequest } from "@monorepo/core-graph-visualisation/layout";

export function createDirectEdgeRoutingConstraints(
  request: GraphLayoutRequest,
): readonly GraphEdgeRouteConstraint[] {
  return request.graph.edges.map((edge) => ({
    sourceNodeId: edge.source.id,
    targetNodeId: edge.target.id,
  }));
}
