import type{IGraph, IGraphNode } from '@monorepo/core-graph';
import type{ ICoreGraphPathGraphAdapter } from './ICoreGraphPathGraphAdapter.js';
import type{ IPathCostCalculator } from './IPathCostCalculator.js';
import type{ IPathfindingRequestValidator } from './IPathfindingRequestValidator.js';
import type{ IPathReconstructionService } from './IPathReconstructionService.js';

/* =================================================================================================
   Composition root
   ================================================================================================= */
export interface ICoreGraphPathfindingComposition {
    createUnweightedAdapter(graph: IGraph): ICoreGraphPathGraphAdapter;
    createWeightedAdapter(
        graph: IGraph,
        costsByAssociationKey: ReadonlyMap<string, number>
    ): ICoreGraphPathGraphAdapter;
    createPathReconstructionService<TNodeId>(): IPathReconstructionService<TNodeId>;
    createPathCostCalculator<TNodeId>(): IPathCostCalculator<TNodeId>;
    createRequestValidator<TNodeId>(): IPathfindingRequestValidator<TNodeId>;
}
