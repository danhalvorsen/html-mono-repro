import   type {IGraph, IGraphNode } from '@monorepo/core-graph';
import type { IReadOnlyPathGraph } from './IReadOnlyPathGraph.js';

/* =================================================================================================
   Adapter contracts
   ================================================================================================= */
export interface ICoreGraphPathGraphAdapter extends IReadOnlyPathGraph<string> {
    readonly graph: IGraph;
}
