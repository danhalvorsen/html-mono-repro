import { beforeEach, describe, expect, it } from "vitest";
import { BreadthFirstPathfinder } from "../src/BreadthFirstPathfinder.js";
import { PathCostCalculator } from "../src/PathCostCalculator.js";
import { PathNeighbor } from "../src/PathNeighbor.js";
import { PathfindingRequest } from "../src/PathfindingRequest.js";
import { PathfindingRequestValidator } from "../src/PathfindingRequestValidator.js";
import { PathReconstructionService } from "../src/PathReconstructionService.js";
import type { IPathNeighbor } from "../src/IPathNeighbor.js";
import type { IReadOnlyPathGraph } from "../src/IReadOnlyPathGraph.js";

class TestPathGraph<TNodeId> implements IReadOnlyPathGraph<TNodeId> {
  private readonly nodeIds: ReadonlySet<TNodeId>;
  private readonly neighborsByNodeId: ReadonlyMap<TNodeId, readonly IPathNeighbor<TNodeId>[]>;

  public constructor(
    nodeIds: readonly TNodeId[],
    neighborsByNodeId: ReadonlyMap<TNodeId, readonly IPathNeighbor<TNodeId>[]>,
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

class BreadthFirstPathfinderFixture {
  public readonly requestValidator: PathfindingRequestValidator<string>;
  public readonly pathReconstructionService: PathReconstructionService<string>;
  public readonly pathCostCalculator: PathCostCalculator<string>;
  public readonly defaultGraph: IReadOnlyPathGraph<string>;

  public constructor() {
    this.requestValidator = new PathfindingRequestValidator<string>();
    this.pathReconstructionService = new PathReconstructionService<string>();
    this.pathCostCalculator = new PathCostCalculator<string>();
    this.defaultGraph = this.createDefaultGraph();
  }

  public createSut(): BreadthFirstPathfinder<string> {
    return new BreadthFirstPathfinder<string>(
      this.requestValidator,
      this.pathReconstructionService,
      this.pathCostCalculator,
    );
  }

  public createRequest(startNodeId: string, goalNodeId: string): PathfindingRequest<string> {
    return new PathfindingRequest<string>(startNodeId, goalNodeId);
  }

  public createDisconnectedGraph(): IReadOnlyPathGraph<string> {
    return new TestPathGraph<string>(
      Object.freeze(["A", "B", "C", "D"]),
      new Map<string, readonly IPathNeighbor<string>[]>([
        ["A", Object.freeze([new PathNeighbor("B", 1)])],
        ["B", Object.freeze([])],
        ["C", Object.freeze([new PathNeighbor("D", 1)])],
        ["D", Object.freeze([])],
      ]),
    );
  }

  public createWeightedBranchGraph(): IReadOnlyPathGraph<string> {
    return new TestPathGraph<string>(
      Object.freeze(["A", "B", "C", "D"]),
      new Map<string, readonly IPathNeighbor<string>[]>([
        [
          "A",
          Object.freeze([
            new PathNeighbor("B", 10),
            new PathNeighbor("C", 1),
          ]),
        ],
        ["B", Object.freeze([new PathNeighbor("D", 10)])],
        ["C", Object.freeze([new PathNeighbor("D", 1)])],
        ["D", Object.freeze([])],
      ]),
    );
  }

  public createCyclicGraph(): IReadOnlyPathGraph<string> {
    return new TestPathGraph<string>(
      Object.freeze(["A", "B", "C", "D"]),
      new Map<string, readonly IPathNeighbor<string>[]>([
        ["A", Object.freeze([new PathNeighbor("B", 1)])],
        ["B", Object.freeze([new PathNeighbor("C", 1)])],
        [
          "C",
          Object.freeze([
            new PathNeighbor("A", 1),
            new PathNeighbor("D", 1),
          ]),
        ],
        ["D", Object.freeze([])],
      ]),
    );
  }

  private createDefaultGraph(): IReadOnlyPathGraph<string> {
    return new TestPathGraph<string>(
      Object.freeze(["A", "B", "C", "D", "E", "F"]),
      new Map<string, readonly IPathNeighbor<string>[]>([
        [
          "A",
          Object.freeze([
            new PathNeighbor("B", 1),
            new PathNeighbor("C", 1),
          ]),
        ],
        [
          "B",
          Object.freeze([
            new PathNeighbor("D", 1),
            new PathNeighbor("E", 1),
          ]),
        ],
        ["C", Object.freeze([new PathNeighbor("F", 1)])],
        ["D", Object.freeze([new PathNeighbor("F", 1)])],
        ["E", Object.freeze([])],
        ["F", Object.freeze([])],
      ]),
    );
  }
}

describe("BreadthFirstPathfinder", () => {
  let fixture: BreadthFirstPathfinderFixture;

  beforeEach(() => {
    fixture = new BreadthFirstPathfinderFixture();
  });

  it("should find the shortest path by edge count", () => {
    const sut = fixture.createSut();
    const request = fixture.createRequest("A", "F");

    const result = sut.findPath(fixture.defaultGraph, request);

    expect(result.found).toBe(true);
    expect(result.path).not.toBeNull();
    expect(result.path?.nodes).toEqual(["A", "C", "F"]);
    expect(result.path?.totalCost).toBe(2);
  });

  it("should return not found when no path exists", () => {
    const sut = fixture.createSut();
    const graph = fixture.createDisconnectedGraph();
    const request = fixture.createRequest("A", "D");

    const result = sut.findPath(graph, request);

    expect(result.found).toBe(false);
    expect(result.path).toBeNull();
  });

  it("should short-circuit when start node equals goal node", () => {
    const sut = fixture.createSut();
    const request = fixture.createRequest("A", "A");

    const result = sut.findPath(fixture.defaultGraph, request);

    expect(result.found).toBe(true);
    expect(result.path).not.toBeNull();
    expect(result.path?.nodes).toEqual(["A"]);
    expect(result.path?.totalCost).toBe(0);
  });

  it("should throw when the start node does not exist", () => {
    const sut = fixture.createSut();
    const request = fixture.createRequest("X", "A");

    expect(() => sut.findPath(fixture.defaultGraph, request)).toThrowError(
      "The start node does not exist in the graph.",
    );
  });

  it("should throw when the goal node does not exist", () => {
    const sut = fixture.createSut();
    const request = fixture.createRequest("A", "X");

    expect(() => sut.findPath(fixture.defaultGraph, request)).toThrowError(
      "The goal node does not exist in the graph.",
    );
  });

  it("should not revisit nodes in a cycle", () => {
    const sut = fixture.createSut();
    const graph = fixture.createCyclicGraph();
    const request = fixture.createRequest("A", "D");

    const result = sut.findPath(graph, request);

    expect(result.found).toBe(true);
    expect(result.path?.nodes).toEqual(["A", "B", "C", "D"]);
    expect(result.path?.totalCost).toBe(3);
  });

  it("should prioritize breadth-first discovery rather than cheapest weighted branch", () => {
    const sut = fixture.createSut();
    const graph = fixture.createWeightedBranchGraph();
    const request = fixture.createRequest("A", "D");

    const result = sut.findPath(graph, request);

    expect(result.found).toBe(true);
    expect(result.path).not.toBeNull();
    expect(result.path?.nodes).toEqual(["A", "B", "D"]);
    expect(result.path?.totalCost).toBe(20);
  });
});