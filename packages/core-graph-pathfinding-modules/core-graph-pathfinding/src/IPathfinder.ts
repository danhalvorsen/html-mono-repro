import type { IReadOnlyPathGraph } from './IReadOnlyPathGraph.js';
import type { IPathfindingRequest } from './IPathfindingRequest.js';
import type { IPathfindingResult } from './IPathfindingResult.js';

export interface IPathfinder<TNodeId> {
    findPath(
        graph: IReadOnlyPathGraph<TNodeId>,
        request: IPathfindingRequest<TNodeId>
    ): IPathfindingResult<TNodeId>;
}
