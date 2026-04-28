import { Guard } from './Guard.js';
import type { IPathCostCalculator } from './IPathCostCalculator.js';
import type { IPathfindingRequest } from './IPathfindingRequest.js';
import type { IPathfindingRequestValidator } from './IPathfindingRequestValidator.js';
import type { IPathfindingResult } from './IPathfindingResult.js';
import type { IPathReconstructionService } from './IPathReconstructionService.js';
import type { IReadOnlyPathGraph } from './IReadOnlyPathGraph.js';
import { Path } from './Path.js';
import { PathfindingAlgorithmBase } from './PathfindingAlgorithmBase.js';
import { PathfindingResult } from './PathfindingResult.js';

/* =================================================================================================
   Optional example algorithm inside the same snippet for completeness.
   In real packaging: move this to "core-graph-pathfinding-breadth-first".
   ================================================================================================= */
export class BreadthFirstPathfinder<TNodeId> extends PathfindingAlgorithmBase<TNodeId> {
    private readonly pathReconstructionService: IPathReconstructionService<TNodeId>;
    private readonly pathCostCalculator: IPathCostCalculator<TNodeId>;

    public constructor(
        requestValidator: IPathfindingRequestValidator<TNodeId>,
        pathReconstructionService: IPathReconstructionService<TNodeId>,
        pathCostCalculator: IPathCostCalculator<TNodeId>
    ) {
        super(requestValidator);
        this.pathReconstructionService = Guard.againstNullOrUndefined(
            pathReconstructionService,
            "pathReconstructionService"
        );
        this.pathCostCalculator = Guard.againstNullOrUndefined(
            pathCostCalculator,
            "pathCostCalculator"
        );
    }

    protected findPathCore(
        graph: IReadOnlyPathGraph<TNodeId>,
        request: IPathfindingRequest<TNodeId>
    ): IPathfindingResult<TNodeId> {
        const queue: TNodeId[] = [request.startNodeId];
        const visited = new Set<TNodeId>([request.startNodeId]);
        const cameFrom = new Map<TNodeId, TNodeId>();

        while (queue.length > 0) {
            const current = queue.shift()!;

            if (current === request.goalNodeId) {
                const nodes = this.pathReconstructionService.reconstruct(
                    cameFrom,
                    request.startNodeId,
                    request.goalNodeId
                );

                const totalCost = this.pathCostCalculator.calculateTotalCost(graph, nodes);
                return PathfindingResult.success(new Path<TNodeId>(nodes, totalCost));
            }

            for (const neighbor of graph.getNeighbors(current)) {
                if (visited.has(neighbor.nodeId)) {
                    continue;
                }

                visited.add(neighbor.nodeId);
                cameFrom.set(neighbor.nodeId, current);
                queue.push(neighbor.nodeId);
            }
        }

        return PathfindingResult.notFound<TNodeId>();
    }
}
