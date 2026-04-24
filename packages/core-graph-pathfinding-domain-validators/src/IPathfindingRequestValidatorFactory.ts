// packages/core-graph-pathfinding-domain-validators/src/IPathfindingRequestValidatorFactory.ts
import type { IPathfindingRequestValidator } from "@monorepo/core-graph-pathfinding-domain";

export interface IPathfindingRequestValidatorFactory {
  create<TNodeId>(): IPathfindingRequestValidator<TNodeId>;
}