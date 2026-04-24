import type { IPathfindingRequest } from "core-graph-pathfinding-domain/src/IPathfindingRequest.js";
import type { IPathfindingRequestValidator } from "core-graph-pathfinding-domain/src/IPathfindingRequestValidator.js";
import type { IReadOnlyPathGraph } from "core-graph-pathfinding-domain/src/IReadOnlyPathGraph.js";

export class RecordingRequestValidator<TNodeId> implements IPathfindingRequestValidator<TNodeId> {
  public invocationCount: number = 0;

  public ValidateTypeAndPayloadBehavior(
    graph: IReadOnlyPathGraph<TNodeId>,
    request: IPathfindingRequest<TNodeId>
  ): void {
    this.invocationCount += 1;

    if (!graph.contains(request.startNodeId)) {
      throw new Error("The start node does not exist in the graph.");
    }

    if (!graph.contains(request.goalNodeId)) {
      throw new Error("The goal node does not exist in the graph.");
    }
  }
}
