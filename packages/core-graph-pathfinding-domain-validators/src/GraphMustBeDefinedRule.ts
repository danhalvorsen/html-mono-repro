// packages/core-graph-pathfinding-domain-validators/src/GraphMustBeDefinedRule.ts
import { ValidationGuard } from "./ValidationGuard.js";
import { type IValidationRule } from "./IValidationRule.js";
import { type IPathfindingRequestValidationContext } from "./IPathfindingRequestValidationContext.js";

export class GraphMustBeDefinedRule<TNodeId>
  implements IValidationRule<IPathfindingRequestValidationContext<TNodeId>>
{
  public validate(context: IPathfindingRequestValidationContext<TNodeId>): void {
    ValidationGuard.againstNullOrUndefined(context, "context");
    ValidationGuard.againstNullOrUndefined(context.graph, "graph");
  }
}