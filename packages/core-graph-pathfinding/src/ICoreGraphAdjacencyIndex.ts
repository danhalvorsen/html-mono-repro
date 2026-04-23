import type { IPathNeighbor } from './IPathNeighbor.js';

export interface ICoreGraphAdjacencyIndex {
    contains(nodeId: string): boolean;
    getNeighbors(nodeId: string): readonly IPathNeighbor<string>[];
}
