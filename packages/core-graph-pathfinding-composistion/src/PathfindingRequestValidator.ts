
/* =================================================================================================
   Domain validator implementation
   ================================================================================================= */

import { IReadOnlyPathGraph } from "@monorepo/core-graph-pathfinding-domain";

export class PathfindingRequestValidator<TNodeId> implements IPathfindingRequestValidator<TNodeId> {
    private readonly validator: IValidator<IPathfindingRequestValidationContext<TNodeId>>;

    public constructor(
        validator: IValidator<IPathfindingRequestValidationContext<TNodeId>>
    ) {
        this.validator = ValidationGuard.againstNullOrUndefined(validator, "validator");
        Object.freeze(this);
    }

    public validate(
        graph: IReadOnlyPathGraph<TNodeId>,
        request: IPathfindingRequest<TNodeId>
    ): void {
        const context = new PathfindingRequestValidationContext<TNodeId>(graph, request);
        this.validator.validate(context);
    }
}
