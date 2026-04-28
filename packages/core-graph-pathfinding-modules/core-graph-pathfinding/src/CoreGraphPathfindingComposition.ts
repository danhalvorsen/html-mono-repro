 
import type { IGraph } from '@monorepo/core-graph';
import { CoreGraphAdjacencyIndexFactory } from './CoreGraphAdjacencyIndexFactory.js';
import { CoreGraphPathGraphAdapter } from './CoreGraphPathGraphAdapter.js';
import { DictionaryEdgeCostStrategy } from './DictionaryEdgeCostStrategy.js';
import { GraphNodeIdSelector } from './GraphNodeIdSelector.js';
import { Guard } from './Guard.js';
import type { ICoreGraphPathfindingComposition } from './ICoreGraphPathfindingComposition.js';
import type { ICoreGraphPathGraphAdapter } from './ICoreGraphPathGraphAdapter.js';
import type { IPathCostCalculator } from './IPathCostCalculator.js';
import type { IPathfindingRequestValidator } from './IPathfindingRequestValidator.js';
import { PathCostCalculator } from './PathCostCalculator.js';
import { PathfindingRequestValidator } from './PathfindingRequestValidator.js';
import { PathReconstructionService } from './PathReconstructionService.js';
import { UnitEdgeCostStrategy } from './UnitEdgeCostStrategy.js';
import type { IPathReconstructionService } from './IPathReconstructionService.js';

export class CoreGraphPathfindingComposition implements ICoreGraphPathfindingComposition {
    public createUnweightedAdapter(graph: IGraph): ICoreGraphPathGraphAdapter {
        Guard.againstNullOrUndefined(graph, "graph");

        const adjacencyIndexFactory = new CoreGraphAdjacencyIndexFactory(
            new UnitEdgeCostStrategy(),
            new GraphNodeIdSelector()
        );

        return new CoreGraphPathGraphAdapter(graph, adjacencyIndexFactory);
    }

    public createWeightedAdapter(
        graph: IGraph,
        costsByAssociationKey: ReadonlyMap<string, number>
    ): ICoreGraphPathGraphAdapter {
        Guard.againstNullOrUndefined(graph, "graph");
        Guard.againstNullOrUndefined(costsByAssociationKey, "costsByAssociationKey");

        const adjacencyIndexFactory = new CoreGraphAdjacencyIndexFactory(
            new DictionaryEdgeCostStrategy(costsByAssociationKey),
            new GraphNodeIdSelector()
        );

        return new CoreGraphPathGraphAdapter(graph, adjacencyIndexFactory);
    }

    public createPathReconstructionService<TNodeId>(): IPathReconstructionService<TNodeId> {
        return new PathReconstructionService<TNodeId>();
    }

    public createPathCostCalculator<TNodeId>(): IPathCostCalculator<TNodeId> {
        return new PathCostCalculator<TNodeId>();
    }

    public createRequestValidator<TNodeId>(): IPathfindingRequestValidator<TNodeId> {
        return new PathfindingRequestValidator<TNodeId>();
    }
}
