/* =========================================================================================
   CLEAN A* IMPLEMENTATION (SOLID, deterministic, no unsafe access)
   ========================================================================================= */

export type NodeId = string;

export interface IPathNeighbor<T> {
  readonly nodeId: T;
  readonly stepCost: number;
}

export interface IReadOnlyPathGraph<T> {
  contains(nodeId: T): boolean;
  getNeighbors(nodeId: T): readonly IPathNeighbor<T>[];
}

export interface IPathfindingRequest<T> {
  readonly startNodeId: T;
  readonly goalNodeId: T;
}

export interface IPath<T> {
  readonly nodes: readonly T[];
  readonly totalCost: number;
}

export interface IPathfindingResult<T> {
  readonly found: boolean;
  readonly path: IPath<T> | null;
}

export interface IHeuristic<T> {
  estimate(from: T, to: T): number;
}

export interface IPathReconstructionService<T> {
  reconstruct(cameFrom: ReadonlyMap<T, T>, start: T, goal: T): readonly T[];
}

export interface IPathCostCalculator<T> {
  calculateTotalCost(graph: IReadOnlyPathGraph<T>, nodes: readonly T[]): number;
}

export interface IPathfindingRequestValidator<T> {
  ValidateTypeAndPayloadBehavior(
    graph: IReadOnlyPathGraph<T>,
    request: IPathfindingRequest<T>,
  ): void;
}

/* =========================================================================================
   VALUE OBJECTS
   ========================================================================================= */

export class Path<T> implements IPath<T> {
  public constructor(
    public readonly nodes: readonly T[],
    public readonly totalCost: number,
  ) {}
}

export class PathfindingResult<T> implements IPathfindingResult<T> {
  private constructor(
    public readonly found: boolean,
    public readonly path: IPath<T> | null,
  ) {}

  public static success<T>(path: IPath<T>): IPathfindingResult<T> {
    return new PathfindingResult(true, path);
  }

  public static notFound<T>(): IPathfindingResult<T> {
    return new PathfindingResult(false, null);
  }
}

/* =========================================================================================
   INFRASTRUCTURE SERVICES
   ========================================================================================= */

export class DefaultRequestValidator<T> implements IPathfindingRequestValidator<T> {
  public ValidateTypeAndPayloadBehavior(
    graph: IReadOnlyPathGraph<T>,
    request: IPathfindingRequest<T>,
  ): void {
    if (!graph.contains(request.startNodeId)) {
      throw new Error("The start node does not exist in the graph.");
    }
    if (!graph.contains(request.goalNodeId)) {
      throw new Error("The goal node does not exist in the graph.");
    }
  }
}

export class PathReconstructionService<T> implements IPathReconstructionService<T> {
  public reconstruct(cameFrom: ReadonlyMap<T, T>, start: T, goal: T): readonly T[] {
    const result: T[] = [goal];
    let current = goal;

    while (current !== start) {
      const parent = cameFrom.get(current);
      if (parent === undefined) break;
      result.push(parent);
      current = parent;
    }

    result.reverse();
    return result;
  }
}

export class PathCostCalculator<T> implements IPathCostCalculator<T> {
  public calculateTotalCost(graph: IReadOnlyPathGraph<T>, nodes: readonly T[]): number {
    let total = 0;

    for (let i = 0; i < nodes.length - 1; i++) {
      const from = nodes[i]!;
      const to = nodes[i + 1]!;

      const neighbors = graph.getNeighbors(from);

      for (const n of neighbors) {
        if (n.nodeId === to) {
          total += n.stepCost;
          break;
        }
      }
    }

    return total;
  }
}

export class ZeroHeuristic<T> implements IHeuristic<T> {
  public estimate(): number {
    return 0;
  }
}

/* =========================================================================================
   PRIORITY QUEUE (MIN HEAP)
   ========================================================================================= */

class MinPriorityQueue<T> {
  private readonly heap: T[] = [];

  public constructor(
    private readonly score: (item: T) => number,
  ) {}

  public enqueue(item: T): void {
    this.heap.push(item);
    this.bubbleUp(this.heap.length - 1);
  }

  public dequeue(): T {
    const root = this.heap[0];
    if (root === undefined) {
      throw new Error("Queue is empty.");
    }

    const last = this.heap.pop();

    if (this.heap.length > 0 && last !== undefined) {
      this.heap[0] = last;
      this.bubbleDown(0);
    }

    return root;
  }

  public get size(): number {
    return this.heap.length;
  }

  private bubbleUp(index: number): void {
    while (index > 0) {
      const parent = Math.floor((index - 1) / 2);
      const item = this.heap[index]!;
      const parentItem = this.heap[parent]!;

      if (this.score(item) >= this.score(parentItem)) {
        break;
      }

      [this.heap[index], this.heap[parent]] = [parentItem, item];

      index = parent;
    }
  }

  private bubbleDown(index: number): void {
    const length = this.heap.length;

    while (true) {
      let smallest = index;
      const left = index * 2 + 1;
      const right = index * 2 + 2;
      const smallestItem = this.heap[smallest]!;

      if (left < length && this.score(this.heap[left]!) < this.score(smallestItem)) {
        smallest = left;
      }

      if (right < length && this.score(this.heap[right]!) < this.score(this.heap[smallest]!)) {
        smallest = right;
      }

      if (smallest === index) break;

      [this.heap[index], this.heap[smallest]] = [this.heap[smallest]!, this.heap[index]!];

      index = smallest;
    }
  }
}

/* =========================================================================================
   A* PATHFINDER
   ========================================================================================= */

export class AStarPathfinder<T> {
  public constructor(
    private readonly validator: IPathfindingRequestValidator<T>,
    private readonly heuristic: IHeuristic<T>,
    private readonly reconstruction: IPathReconstructionService<T>,
    private readonly costCalculator: IPathCostCalculator<T>,
  ) {}

  public findPath(
    graph: IReadOnlyPathGraph<T>,
    request: IPathfindingRequest<T>,
  ): IPathfindingResult<T> {
    this.validator.ValidateTypeAndPayloadBehavior(graph, request);

    const start = request.startNodeId;
    const goal = request.goalNodeId;

    if (start === goal) {
      return PathfindingResult.success(new Path([start], 0));
    }

    const gScore = new Map<T, number>();
    const fScore = new Map<T, number>();
    const cameFrom = new Map<T, T>();
    const openSet = new Set<T>();

    const openQueue = new MinPriorityQueue<T>(
      (id) => fScore.get(id) ?? Number.POSITIVE_INFINITY,
    );

    gScore.set(start, 0);
    fScore.set(start, this.heuristic.estimate(start, goal));

    openQueue.enqueue(start);
    openSet.add(start);

    while (openQueue.size > 0) {
      const current = openQueue.dequeue();

      if (!openSet.has(current)) continue;
      openSet.delete(current);

      if (current === goal) {
        const nodes = this.reconstruction.reconstruct(cameFrom, start, goal);
        const cost = this.costCalculator.calculateTotalCost(graph, nodes);
        return PathfindingResult.success(new Path(nodes, cost));
      }

      for (const neighbor of graph.getNeighbors(current)) {
        const currentScore = gScore.get(current) ?? Number.POSITIVE_INFINITY;
        const tentative = currentScore + neighbor.stepCost;
        const previous = gScore.get(neighbor.nodeId) ?? Number.POSITIVE_INFINITY;

        if (tentative >= previous) continue;

        cameFrom.set(neighbor.nodeId, current);
        gScore.set(neighbor.nodeId, tentative);

        const f = tentative + this.heuristic.estimate(neighbor.nodeId, goal);
        fScore.set(neighbor.nodeId, f);

        openQueue.enqueue(neighbor.nodeId);
        openSet.add(neighbor.nodeId);
      }
    }

    return PathfindingResult.notFound<T>();
  }
}
