
import {
  type IReadOnlyPathGraph,
  type IPathfindingRequest,
} from "@monorepo/core-graph-pathfinding-domain";

export interface IPathfindingRequestValidationContext<TNodeId> {
  readonly graph: IReadOnlyPathGraph<TNodeId>;
  readonly request: IPathfindingRequest<TNodeId>;
}