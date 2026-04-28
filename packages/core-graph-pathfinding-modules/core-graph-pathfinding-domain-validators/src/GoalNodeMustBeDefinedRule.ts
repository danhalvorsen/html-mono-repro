import { ValidationGuard } from "./ValidationGuard.js";
import { type IValidationRule } from "./IValidationRule.js";
import { type IPathfindingRequestValidationContext } from "./IPathfindingRequestValidationContext.js";

export class GoalNodeMustBeDefinedRule<TNodeId>
    implements IValidationRule<IPathfindingRequestValidationContext<TNodeId>> {
    public validate(context: IPathfindingRequestValidationContext<TNodeId>): void {
        ValidationGuard.againstNullOrUndefined(context, "context");
        ValidationGuard.againstNullOrUndefined(context.request, "request");
        ValidationGuard.againstNullOrUndefined(context.request.goalNodeId, "request.goalNodeId");
    }
}
