import type { IPathfindingRequest } from "core-graph-pathfinding-domain/src/IPathfindingRequest.js";
import type { IPathfindingRequestValidator } from "core-graph-pathfinding-domain/src/IPathfindingRequestValidator.js";
import type { IPathfindingResult } from "core-graph-pathfinding-domain/src/IPathfindingResult.js";
import type { IReadOnlyPathGraph } from "core-graph-pathfinding-domain/src/IReadOnlyPathGraph.js";
import { PathfindingAlgorithmBase } from "core-graph-pathfinding-domain/src/PathfindingAlgorithmBase.js";

export class FakePathfindingAlgorithm<TNodeId> extends PathfindingAlgorithmBase<TNodeId> {
  public invocationCount: number = 0;
  private readonly resultFactory: (
    graph: IReadOnlyPathGraph<TNodeId>,
    request: IPathfindingRequest<TNodeId>
  ) => IPathfindingResult<TNodeId>;

  public constructor(
    requestValidator: IPathfindingRequestValidator<TNodeId>,
    resultFactory: (
      graph: IReadOnlyPathGraph<TNodeId>,
      request: IPathfindingRequest<TNodeId>
    ) => IPathfindingResult<TNodeId>
  ) {
    super(requestValidator);
    this.resultFactory = resultFactory;
  }

  protected findPathCore(
    graph: IReadOnlyPathGraph<TNodeId>,
    request: IPathfindingRequest<TNodeId>
  ): IPathfindingResult<TNodeId> {
    this.invocationCount += 1;
    return this.resultFactory(graph, request);
  }
}
