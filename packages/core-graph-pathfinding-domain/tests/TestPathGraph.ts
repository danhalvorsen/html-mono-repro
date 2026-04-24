import type { IPathNeighbor } from "core-graph-pathfinding-domain/src/IPathNeighbor.js";
import type { IReadOnlyPathGraph } from "core-graph-pathfinding-domain/src/IReadOnlyPathGraph.js";

export class TestPathGraph<TNodeId> implements IReadOnlyPathGraph<TNodeId> {
  private readonly neighborsByNodeId: Map<TNodeId, readonly IPathNeighbor<TNodeId>[]>;
  private readonly nodeIds: Set<TNodeId>;

  public constructor(
    nodeIds: readonly TNodeId[],
    neighborsByNodeId: ReadonlyMap<TNodeId, readonly IPathNeighbor<TNodeId>[]>
  ) {
    this.nodeIds = new Set(nodeIds);
    this.neighborsByNodeId = new Map(neighborsByNodeId);
  }

  public contains(nodeId: TNodeId): boolean {
    return this.nodeIds.has(nodeId);
  }

  public getNeighbors(nodeId: TNodeId): readonly IPathNeighbor<TNodeId>[] {
    return this.neighborsByNodeId.get(nodeId) ?? [];
  }
}
