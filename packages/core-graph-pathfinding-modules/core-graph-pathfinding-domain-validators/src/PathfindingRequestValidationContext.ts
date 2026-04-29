import { ValidationGuard } from "./ValidationGuard.js";
import { type IPathfindingRequestValidationContext } from "./IPathfindingRequestValidationContext.js";
import type { IPathfindingRequest, IReadOnlyPathGraph } from "@monorepo/core-graph-pathfinding-domain";

export class PathfindingRequestValidationContext<TNodeId>
    implements IPathfindingRequestValidationContext<TNodeId> {
    public readonly graph: IReadOnlyPathGraph<TNodeId>;
    public readonly request: IPathfindingRequest<TNodeId>;

    public constructor(
        graph: IReadOnlyPathGraph<TNodeId>,
        request: IPathfindingRequest<TNodeId>
    ) {
        this.graph = ValidationGuard.againstNullOrUndefined(graph, "graph");
        this.request = ValidationGuard.againstNullOrUndefined(request, "request");

        Object.freeze(this);
    }
}
