import { Guard } from './Guard.js';
import type { IPathfindingRequest } from './IPathfindingRequest.js';
import type { IPathfindingRequestValidator } from './IPathfindingRequestValidator.js';
import type { IReadOnlyPathGraph } from './IReadOnlyPathGraph.js';

export class PathfindingRequestValidator<TNodeId> implements IPathfindingRequestValidator<TNodeId> {
    public validate(
        graph: IReadOnlyPathGraph<TNodeId>,
        request: IPathfindingRequest<TNodeId>
    ): void {
        Guard.againstNullOrUndefined(graph, "graph");
        Guard.againstNullOrUndefined(request, "request");
        Guard.againstNullOrUndefined(request.startNodeId, "request.startNodeId");
        Guard.againstNullOrUndefined(request.goalNodeId, "request.goalNodeId");

        if (!graph.contains(request.startNodeId)) {
            throw new Error("The start node does not exist in the graph.");
        }

        if (!graph.contains(request.goalNodeId)) {
            throw new Error("The goal node does not exist in the graph.");
        }
    }
}
