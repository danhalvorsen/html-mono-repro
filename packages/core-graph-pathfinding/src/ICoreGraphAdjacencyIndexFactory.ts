 
import type { IGraph } from '@monorepo/core-graph';
import type { ICoreGraphAdjacencyIndex } from './ICoreGraphAdjacencyIndex.js';

export interface ICoreGraphAdjacencyIndexFactory {
    create(graph: IGraph): ICoreGraphAdjacencyIndex;
}
