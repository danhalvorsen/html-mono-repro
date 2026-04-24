import {
 
  type IPathfindingRequestValidator,
} from "@monorepo/core-graph-pathfinding-domain";
export interface IPathfindingDomainValidatorsComposition {
  createPathfindingRequestValidator<TNodeId>(): IPathfindingRequestValidator<TNodeId>;
}