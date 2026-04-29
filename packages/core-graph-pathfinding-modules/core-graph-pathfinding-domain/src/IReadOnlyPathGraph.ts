import { type IPathNeighbor } from "./IPathNeighbor.js";

export interface IReadOnlyPathGraph<TNodeId> {
    contains(nodeId: TNodeId): boolean;
    getNeighbors(nodeId: TNodeId): readonly IPathNeighbor<TNodeId>[];
}
