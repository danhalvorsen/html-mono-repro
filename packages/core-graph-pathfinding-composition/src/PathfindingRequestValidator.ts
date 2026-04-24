
/* =================================================================================================
   Domain validator implementation
   ================================================================================================= */

import type { IReadOnlyPathGraph, IPathfindingRequest, IPathfindingRequestValidator } from "@monorepo/core-graph-pathfinding-domain";

export class PathfindingRequestValidator<TNodeId> implements IPathfindingRequestValidator<TNodeId> {
	public ValidateTypeAndPayloadBehavior(
		graph: IReadOnlyPathGraph<TNodeId>,
		request: IPathfindingRequest<TNodeId>
	): void {
		if (!graph.contains(request.startNodeId)) {
			throw new Error("The start node does not exist in the graph.");
		}
		if (!graph.contains(request.goalNodeId)) {
			throw new Error("The goal node does not exist in the graph.");
		}
	}
}
