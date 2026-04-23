// packages/core-graph-pathfinding-domain/src/IPathfindingRequestValidator.ts

import type { IReadOnlyPathGraph } from "./IReadOnlyPathGraph.js";
import type { IPathfindingRequest } from "./IPathfindingRequest.js";
 
export interface IPathfindingRequestValidator<TNodeId> {
  ValidateTypeAndPayloadBehavior(
    graph: IReadOnlyPathGraph<TNodeId>,
    request: IPathfindingRequest<TNodeId>
  ): void;
}