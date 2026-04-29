import type { IPathfindingRequest } from './IPathfindingRequest.js';
import type { IReadOnlyPathGraph } from './IReadOnlyPathGraph.js';

/* =================================================================================================
   Validation service
   ================================================================================================= */
export interface IPathfindingRequestValidator<TNodeId> {
    validate(
        graph: IReadOnlyPathGraph<TNodeId>,
        request: IPathfindingRequest<TNodeId>
    ): void;
}
