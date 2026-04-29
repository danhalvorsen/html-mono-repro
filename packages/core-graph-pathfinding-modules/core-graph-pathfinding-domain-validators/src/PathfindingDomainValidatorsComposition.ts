// CHANGE
// packages/core-graph-pathfinding-domain-validators/src/PathfindingDomainValidatorsComposition.ts

import { type IPathfindingRequestValidator } from "@monorepo/core-graph-pathfinding-domain";
import { ValidationGuard } from "./ValidationGuard.js";
import { type IPathfindingDomainValidatorsComposition } from "./IPathfindingDomainValidatorsComposition.js";
import { type IPathfindingRequestValidatorFactory } from "./IPathfindingRequestValidatorFactory.js";
import { PathfindingRequestValidatorFactory } from "./PathfindingRequestValidatorFactory.js";

export class PathfindingDomainValidatorsComposition
  implements IPathfindingDomainValidatorsComposition
{
  private readonly factory: IPathfindingRequestValidatorFactory;

  public constructor(
    factory: IPathfindingRequestValidatorFactory = new PathfindingRequestValidatorFactory(),
  ) {
    this.factory = ValidationGuard.againstNullOrUndefined(factory, "factory");
    Object.freeze(this);
  }

  public createPathfindingRequestValidator<
    TNodeId,
  >(): IPathfindingRequestValidator<TNodeId> {
    return this.factory.create<TNodeId>();
  }
}
