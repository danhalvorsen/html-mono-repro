 
/* =================================================================================================
   Algorithm base class
   - Useful for BFS, Dijkstra, A*
   - Concrete algorithms belong in separate modules, but this base is valid domain code.
   ================================================================================================= */

import { DomainGuard } from "./DomainGuard.js";
import {type  IPathfinder } from "./IPathfinder.js";
import { type IPathfindingRequest } from "./IPathfindingRequest.js";
import { type IPathfindingRequestValidator } from "./IPathfindingRequestValidator.js";
import { type IPathfindingResult } from "./IPathfindingResult.js";
import { type IReadOnlyPathGraph } from "./IReadOnlyPathGraph.js";
import { Path } from "./Path.js";
import { PathfindingResult } from "./PathfindingResult.js";

export abstract class PathfindingAlgorithmBase<TNodeId> implements IPathfinder<TNodeId> {
    private readonly requestValidator: IPathfindingRequestValidator<TNodeId>;

    protected constructor(requestValidator: IPathfindingRequestValidator<TNodeId>) {
        this.requestValidator = DomainGuard.againstNullOrUndefined(requestValidator, "requestValidator");
    }

    public findPath(
        graph: IReadOnlyPathGraph<TNodeId>,
        request: IPathfindingRequest<TNodeId>
    ): IPathfindingResult<TNodeId> {
        DomainGuard.againstNullOrUndefined(graph, "graph");
        DomainGuard.againstNullOrUndefined(request, "request");

        this.requestValidator.ValidateTypeAndPayloadBehavior(graph, request);

        if (request.startNodeId === request.goalNodeId) {
            return PathfindingResult.success(
                new Path<TNodeId>(Object.freeze([request.startNodeId]), 0)
            );
        }

        return this.findPathCore(graph, request);
    }

    protected abstract findPathCore(
        graph: IReadOnlyPathGraph<TNodeId>,
        request: IPathfindingRequest<TNodeId>
    ): IPathfindingResult<TNodeId>;
}
