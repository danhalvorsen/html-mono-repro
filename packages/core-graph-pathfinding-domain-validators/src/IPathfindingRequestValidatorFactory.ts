// packages/core-graph-pathfinding-domain-validators/src/IPathfindingRequestValidatorFactory.ts
import {   IPathfindingRequestValidator } from "@monorepo/core-graph-pathfinding-domain";

export interface IPathfindingRequestValidatorFactory {
  create<TNodeId>(): IPathfindingRequestValidator<TNodeId>;
}