// packages/core-graph-pathfinding-a-star/tests/AStarPathfinder.spec.ts

import { beforeEach, describe, expect, it } from "vitest";
import {
  PathCostCalculator,
  PathfindingRequest,
  PathNeighbor,
  PathReconstructionService,
  ZeroHeuristic,
  type IHeuristic,
  type IReadOnlyPathGraph,
  type IPathNeighbor,
} from "@monorepo/core-graph-pathfinding-domain";
import { PathfindingRequestValidator } from "@monorepo/core-graph-pathfinding-composition";
import { AStarPathfinder } from "../src/AStarPathfinder.js";

class TestPathGraph<TNodeId> implements IReadOnlyPathGraph<TNodeId> {
  private readonly nodes: ReadonlySet<TNodeId>;
  private readonly neighborsByNodeId: ReadonlyMap<TNodeId, readonly IPathNeighbor<TNodeId>[]>;

  public constructor(
    nodeIds: readonly TNodeId[],
    neighborsByNodeId: ReadonlyMap<TNodeId, readonly IPathNeighbor<TNodeId>[]>,
  ) {
    this.nodes = new Set(nodeIds);
    this.neighborsByNodeId = new Map(neighborsByNodeId);
  }

  public contains(nodeId: TNodeId): boolean {
    return this.nodes.has(nodeId);
  }

  public getNeighbors(nodeId: TNodeId): readonly IPathNeighbor<TNodeId>[] {
    return this.neighborsByNodeId.get(nodeId) ?? [];
  }
}

class CoordinateHeuristic implements IHeuristic<string> {
  private readonly coordinates: ReadonlyMap<string, readonly [number, number]>;

  public constructor(coordinates: ReadonlyMap<string, readonly [number, number]>) {
    this.coordinates = coordinates;
  }

  public estimate(currentNodeId: string, goalNodeId: string): number {
    const current = this.coordinates.get(currentNodeId);
    const goal = this.coordinates.get(goalNodeId);

    if (current === undefined) {
      throw new Error(`Missing coordinates for node '${currentNodeId}'.`);
    }

    if (goal === undefined) {
      throw new Error(`Missing coordinates for node '${goalNodeId}'.`);
    }

    const dx = goal[0] - current[0];
    const dy = goal[1] - current[1];

    return Math.abs(dx) + Math.abs(dy);
  }
}

class AStarPathfinderFixture {
  public readonly requestValidator: PathfindingRequestValidator<string>;
  public readonly reconstructionService: PathReconstructionService<string>;
  public readonly costCalculator: PathCostCalculator<string>;
  public readonly zeroHeuristic: ZeroHeuristic<string>;
  public readonly graph: IReadOnlyPathGraph<string>;
  public readonly heuristicGraph: IReadOnlyPathGraph<string>;
  public readonly coordinates: ReadonlyMap<string, readonly [number, number]>;

  public constructor() {
    this.requestValidator = new PathfindingRequestValidator<string>();
    this.reconstructionService = new PathReconstructionService<string>();
    this.costCalculator = new PathCostCalculator<string>();
    this.zeroHeuristic = new ZeroHeuristic<string>();

    this.graph = new TestPathGraph<string>(
      Object.freeze(["A", "B", "C", "D", "E"]),
      new Map<string, readonly IPathNeighbor<string>[]>([
        [
          "A",
          Object.freeze([
            new PathNeighbor("B", 1),
            new PathNeighbor("C", 4),
          ]),
        ],
        [
          "B",
          Object.freeze([
            new PathNeighbor("C", 2),
            new PathNeighbor("D", 5),
          ]),
        ],
        ["C", Object.freeze([new PathNeighbor("D", 1)])],
        ["D", Object.freeze([new PathNeighbor("E", 3)])],
        ["E", Object.freeze([])],
      ]),
    );

    this.coordinates = new Map<string, readonly [number, number]>([
      ["A", [0, 0]],
      ["B", [1, 0]],
      ["C", [2, 0]],
      ["D", [3, 0]],
      ["E", [4, 0]],
      ["F", [5, 0]],
    ]);

    this.heuristicGraph = new TestPathGraph<string>(
      Object.freeze(["A", "B", "C", "D", "E", "F"]),
      new Map<string, readonly IPathNeighbor<string>[]>([
        [
          "A",
          Object.freeze([
            new PathNeighbor("B", 1),
            new PathNeighbor("C", 10),
          ]),
        ],
        ["B", Object.freeze([new PathNeighbor("D", 1)])],
        ["C", Object.freeze([new PathNeighbor("F", 1)])],
        ["D", Object.freeze([new PathNeighbor("E", 1)])],
        ["E", Object.freeze([])],
        ["F", Object.freeze([new PathNeighbor("E", 1)])],
      ]),
    );
  }

  public createSut(heuristic?: IHeuristic<string>): AStarPathfinder<string> {
    return new AStarPathfinder<string>(
      this.requestValidator,
      heuristic ?? this.zeroHeuristic,
      this.reconstructionService,
      this.costCalculator,
    );
  }
}

describe("AStarPathfinder", () => {
  let fixture: AStarPathfinderFixture;

  beforeEach(() => {
    fixture = new AStarPathfinderFixture();
  });

  it("should find the lowest-cost path", () => {
    const sut = fixture.createSut();
    const request = new PathfindingRequest<string>("A", "E");

    const result = sut.findPath(fixture.graph, request);

    expect(result.found).toBe(true);
    expect(result.path).not.toBeNull();
    expect(result.path?.nodes).toEqual(["A", "B", "C", "D", "E"]);
    expect(result.path?.totalCost).toBe(7);
  });

  it("should return not found when no path exists", () => {
    const sut = fixture.createSut();
    const disconnectedGraph = new TestPathGraph<string>(
      Object.freeze(["A", "B", "C"]),
      new Map<string, readonly IPathNeighbor<string>[]>([
        ["A", Object.freeze([new PathNeighbor("B", 1)])],
        ["B", Object.freeze([])],
        ["C", Object.freeze([])],
      ]),
    );
    const request = new PathfindingRequest<string>("A", "C");

    const result = sut.findPath(disconnectedGraph, request);

    expect(result.found).toBe(false);
    expect(result.path).toBeNull();
  });

  it("should honor heuristic guidance and still produce the optimal path", () => {
    const heuristic = new CoordinateHeuristic(fixture.coordinates);
    const sut = fixture.createSut(heuristic);
    const request = new PathfindingRequest<string>("A", "E");

    const result = sut.findPath(fixture.heuristicGraph, request);

    expect(result.found).toBe(true);
    expect(result.path).not.toBeNull();
    expect(result.path?.nodes).toEqual(["A", "B", "D", "E"]);
    expect(result.path?.totalCost).toBe(3);
  });

  it("should prefer an improved route discovered later", () => {
    const sut = fixture.createSut();
    const graph = new TestPathGraph<string>(
      Object.freeze(["A", "B", "C", "D"]),
      new Map<string, readonly IPathNeighbor<string>[]>([
        [
          "A",
          Object.freeze([
            new PathNeighbor("B", 5),
            new PathNeighbor("C", 1),
          ]),
        ],
        ["C", Object.freeze([new PathNeighbor("B", 1)])],
        ["B", Object.freeze([new PathNeighbor("D", 1)])],
        ["D", Object.freeze([])],
      ]),
    );
    const request = new PathfindingRequest<string>("A", "D");

    const result = sut.findPath(graph, request);

    expect(result.found).toBe(true);
    expect(result.path?.nodes).toEqual(["A", "C", "B", "D"]);
    expect(result.path?.totalCost).toBe(3);
  });

  it("should short-circuit when start and goal are the same", () => {
    const sut = fixture.createSut();
    const request = new PathfindingRequest<string>("A", "A");

    const result = sut.findPath(fixture.graph, request);

    expect(result.found).toBe(true);
    expect(result.path).not.toBeNull();
    expect(result.path?.nodes).toEqual(["A"]);
    expect(result.path?.totalCost).toBe(0);
  });

  it("should throw when start node does not exist", () => {
    const sut = fixture.createSut();
    const request = new PathfindingRequest<string>("X", "A");

    expect(() => sut.findPath(fixture.graph, request)).toThrowError(
      "The start node does not exist in the graph.",
    );
  });

  it("should throw when goal node does not exist", () => {
    const sut = fixture.createSut();
    const request = new PathfindingRequest<string>("A", "X");

    expect(() => sut.findPath(fixture.graph, request)).toThrowError(
      "The goal node does not exist in the graph.",
    );
  });
});