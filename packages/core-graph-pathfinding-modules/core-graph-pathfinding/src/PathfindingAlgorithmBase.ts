import { Guard } from './Guard.js';
import type { IPathfinder } from './IPathfinder.js';
import type { IPathfindingRequest } from './IPathfindingRequest.js';
import type { IPathfindingRequestValidator } from './IPathfindingRequestValidator.js';
import type { IPathfindingResult } from './IPathfindingResult.js';
import type { IReadOnlyPathGraph } from './IReadOnlyPathGraph.js';
import { Path } from './Path.js';
import { PathfindingResult } from './PathfindingResult.js';

/* =================================================================================================
   Reusable base class for algorithm modules
   ================================================================================================= */
export abstract class PathfindingAlgorithmBase<TNodeId> implements IPathfinder<TNodeId> {
    private readonly requestValidator: IPathfindingRequestValidator<TNodeId>;

    protected constructor(requestValidator: IPathfindingRequestValidator<TNodeId>) {
        this.requestValidator = Guard.againstNullOrUndefined(requestValidator, "requestValidator");
    }

    public findPath(
        graph: IReadOnlyPathGraph<TNodeId>,
        request: IPathfindingRequest<TNodeId>
    ): IPathfindingResult<TNodeId> {
        Guard.againstNullOrUndefined(graph, "graph");
        Guard.againstNullOrUndefined(request, "request");

        this.requestValidator.validate(graph, request);

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
