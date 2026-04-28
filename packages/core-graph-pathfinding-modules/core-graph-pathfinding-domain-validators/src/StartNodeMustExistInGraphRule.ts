import { ValidationGuard } from "./ValidationGuard.js";
import { type IValidationRule } from "./IValidationRule.js";
import { type IPathfindingRequestValidationContext } from "./IPathfindingRequestValidationContext.js";

export class StartNodeMustExistInGraphRule<TNodeId>
    implements IValidationRule<IPathfindingRequestValidationContext<TNodeId>> {
    public validate(context: IPathfindingRequestValidationContext<TNodeId>): void {
        ValidationGuard.againstNullOrUndefined(context, "context");
        ValidationGuard.againstNullOrUndefined(context.graph, "graph");
        ValidationGuard.againstNullOrUndefined(context.request, "request");
        ValidationGuard.againstNullOrUndefined(context.request.startNodeId, "request.startNodeId");

        if (!context.graph.contains(context.request.startNodeId)) {
            throw new Error("The start node does not exist in the graph.");
        }
    }
}
