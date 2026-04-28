// packages/core-graph-pathfinding-domain-validators/src/PathfindingRequestValidator.ts

import type {
  IReadOnlyPathGraph,
  IPathfindingRequest,
  IPathfindingRequestValidator,
} from "@monorepo/core-graph-pathfinding-domain";

import type { IPathfindingRequestValidationContext } from "./IPathfindingRequestValidationContext.js";
import type { IValidator } from "./IValidator.js";

import { PathfindingRequestValidationContext } from "./PathfindingRequestValidationContext.js";
import { ValidationGuard } from "./ValidationGuard.js";

export class PathfindingRequestValidator<TNodeId>
  implements IPathfindingRequestValidator<TNodeId>
{
  private readonly validator: IValidator<IPathfindingRequestValidationContext<TNodeId>>;

  public constructor(
    validator: IValidator<IPathfindingRequestValidationContext<TNodeId>>,
  ) {
    this.validator = ValidationGuard.againstNullOrUndefined(validator, "validator");
    Object.freeze(this);
  }

  public ValidateTypeAndPayloadBehavior(
    graph: IReadOnlyPathGraph<TNodeId>,
    request: IPathfindingRequest<TNodeId>,
  ): void {
    const context = new PathfindingRequestValidationContext<TNodeId>(graph, request);
    this.validator.validate(context);
  }

  public validate(
    graph: IReadOnlyPathGraph<TNodeId>,
    request: IPathfindingRequest<TNodeId>,
  ): void {
    this.ValidateTypeAndPayloadBehavior(graph, request);
  }
}