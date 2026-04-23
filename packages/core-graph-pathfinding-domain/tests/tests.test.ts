// core-graph-pathfinding-domain/tests/core-graph-pathfinding-domain.spec.ts
import { beforeEach, describe, expect, it } from "vitest";  
import { IReadOnlyPathGraph } from "../src/IReadOnlyPathGraph.js";  
import { PathfindingDomainComposition } from "core-graph-pathfinding-composistion/src/PathfindingDomainComposition.js";
import { ZeroHeuristic } from "core-graph-pathfinding-domain/src/ZeroHeuristic.js";
import { IPathNeighbor, IPathfindingRequestValidator, IPathfindingRequest, PathfindingAlgorithmBase, IPathfindingResult, PathReconstructionService, PathCostCalculator, PathfindingRequest, PathNeighbor, PathfindingResult, PathfindingRequestValidator } from "core-graph-pathfinding/src/code.js";
import { Path } from "core-graph-pathfinding-domain/src/Path.js";
 
class TestPathGraph<TNodeId> implements IReadOnlyPathGraph<TNodeId> {
  private readonly neighborsByNodeId: Map<TNodeId, readonly IPathNeighbor<TNodeId>[]>;
  private readonly nodeIds: Set<TNodeId>;

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

class RecordingRequestValidator<TNodeId> implements IPathfindingRequestValidator<TNodeId> {
  public invocationCount: number = 0;

  public validate(
    graph: IReadOnlyPathGraph<TNodeId>,
    request: IPathfindingRequest<TNodeId>,
  ): void {
    this.invocationCount += 1;

    if (!graph.contains(request.startNodeId)) {
      throw new Error("The start node does not exist in the graph.");
    }

    if (!graph.contains(request.goalNodeId)) {
      throw new Error("The goal node does not exist in the graph.");
    }
  }
}

class FakePathfindingAlgorithm<TNodeId> extends PathfindingAlgorithmBase<TNodeId> {
  public invocationCount: number = 0;
  private readonly resultFactory: (
    graph: IReadOnlyPathGraph<TNodeId>,
    request: IPathfindingRequest<TNodeId>,
  ) => IPathfindingResult<TNodeId>;

  public constructor(
    requestValidator: IPathfindingRequestValidator<TNodeId>,
    resultFactory: (
      graph: IReadOnlyPathGraph<TNodeId>,
      request: IPathfindingRequest<TNodeId>,
    ) => IPathfindingResult<TNodeId>,
  ) {
    super(requestValidator);
    this.resultFactory = resultFactory;
  }

  protected findPathCore(
    graph: IReadOnlyPathGraph<TNodeId>,
    request: IPathfindingRequest<TNodeId>,
  ): IPathfindingResult<TNodeId> {
    this.invocationCount += 1;
    return this.resultFactory(graph, request);
  }
}

class PathfindingDomainFixture {
  public readonly requestValidator: RecordingRequestValidator<string>;
  public readonly pathReconstructionService: PathReconstructionService<string>;
  public readonly pathCostCalculator: PathCostCalculator<string>;
  public readonly zeroHeuristic: ZeroHeuristic<string>;
  public readonly graph: IReadOnlyPathGraph<string>;
  public readonly requestFromAtoC: PathfindingRequest<string>;
  public readonly requestFromAtoA: PathfindingRequest<string>;

  public constructor() {
    this.requestValidator = new RecordingRequestValidator<string>();
    this.pathReconstructionService = new PathReconstructionService<string>();
    this.pathCostCalculator = new PathCostCalculator<string>();
    this.zeroHeuristic = new ZeroHeuristic<string>();

    const neighborsByNodeId = new Map<string, readonly IPathNeighbor<string>[]>([
      [
        "A",
        Object.freeze([
          new PathNeighbor<string>("B", 2),
          new PathNeighbor<string>("C", 5),
        ]),
      ],
      [
        "B",
        Object.freeze([
          new PathNeighbor<string>("C", 3),
        ]),
      ],
      [
        "C",
        Object.freeze([]),
      ],
    ]);

    this.graph = new TestPathGraph<string>(
      Object.freeze(["A", "B", "C"]),
      neighborsByNodeId,
    );

    this.requestFromAtoC = new PathfindingRequest<string>("A", "C");
    this.requestFromAtoA = new PathfindingRequest<string>("A", "A");
  }

  public createPath(nodes: readonly string[], totalCost: number): Path<string> {
    return new Path<string>(nodes, totalCost);
  }

  public createFoundResult(nodes: readonly string[], totalCost: number): PathfindingResult<string> {
    return PathfindingResult.success(this.createPath(nodes, totalCost));
  }

  public createAlgorithm(
    resultFactory: (
      graph: IReadOnlyPathGraph<string>,
      request: IPathfindingRequest<string>,
    ) => IPathfindingResult<string>,
  ): FakePathfindingAlgorithm<string> {
    return new FakePathfindingAlgorithm<string>(this.requestValidator, resultFactory);
  }
}

describe("core-graph-pathfinding-domain", () => {
  let fixture: PathfindingDomainFixture;

  beforeEach(() => {
    fixture = new PathfindingDomainFixture();
  });

  describe("PathNeighbor", () => {
    it("should create immutable neighbor with node id and step cost", () => {
      const sut = new PathNeighbor<string>("B", 7);

      expect(sut.nodeId).toBe("B");
      expect(sut.stepCost).toBe(7);
      expect(Object.isFrozen(sut)).toBe(true);
    });

    it("should throw when step cost is negative", () => {
      expect(() => new PathNeighbor<string>("B", -1)).toThrowError("stepCost cannot be negative.");
    });
  });

  describe("PathfindingRequest", () => {
    it("should create immutable request", () => {
      const sut = new PathfindingRequest<string>("A", "C");

      expect(sut.startNodeId).toBe("A");
      expect(sut.goalNodeId).toBe("C");
      expect(Object.isFrozen(sut)).toBe(true);
    });

    it("should throw when start node id is null", () => {
      expect(() => new PathfindingRequest<string>(null as unknown as string, "C")).toThrowError(
        "startNodeId cannot be null or undefined.",
      );
    });

    it("should throw when goal node id is null", () => {
      expect(() => new PathfindingRequest<string>("A", null as unknown as string)).toThrowError(
        "goalNodeId cannot be null or undefined.",
      );
    });
  });

  describe("Path", () => {
    it("should create immutable path with nodes and total cost", () => {
      const sut = new Path<string>(Object.freeze(["A", "B", "C"]), 5);

      expect(sut.nodes).toEqual(["A", "B", "C"]);
      expect(sut.totalCost).toBe(5);
      expect(Object.isFrozen(sut)).toBe(true);
      expect(Object.isFrozen(sut.nodes)).toBe(true);
    });

    it("should defensively copy node collection", () => {
      const source = ["A", "B", "C"];
      const sut = new Path<string>(source, 5);

      source.push("D");

      expect(sut.nodes).toEqual(["A", "B", "C"]);
    });

    it("should throw when nodes is empty", () => {
      expect(() => new Path<string>(Object.freeze([]), 0)).toThrowError("nodes cannot be empty.");
    });

    it("should throw when total cost is negative", () => {
      expect(() => new Path<string>(Object.freeze(["A"]), -1)).toThrowError(
        "totalCost cannot be negative.",
      );
    });
  });

  describe("PathfindingResult", () => {
    it("should create success result", () => {
      const path = fixture.createPath(Object.freeze(["A", "B", "C"]), 5);
      const sut = PathfindingResult.success(path);

      expect(sut.found).toBe(true);
      expect(sut.path).toBe(path);
      expect(Object.isFrozen(sut)).toBe(true);
    });

    it("should create not found result", () => {
      const sut = PathfindingResult.notFound<string>();

      expect(sut.found).toBe(false);
      expect(sut.path).toBeNull();
      expect(Object.isFrozen(sut)).toBe(true);
    });
  });

  describe("PathReconstructionService", () => {
    it("should reconstruct path from predecessor chain", () => {
      const cameFrom = new Map<string, string>([
        ["B", "A"],
        ["C", "B"],
      ]);

      const result = fixture.pathReconstructionService.reconstruct(cameFrom, "A", "C");

      expect(result).toEqual(["A", "B", "C"]);
      expect(Object.isFrozen(result)).toBe(true);
    });

    it("should throw when predecessor chain is incomplete", () => {
      const cameFrom = new Map<string, string>([
        ["C", "B"],
      ]);

      expect(() =>
        fixture.pathReconstructionService.reconstruct(cameFrom, "A", "C"),
      ).toThrowError("Cannot reconstruct path because the predecessor chain is incomplete.");
    });
  });

  describe("PathCostCalculator", () => {
    it("should calculate total cost for a valid path", () => {
      const result = fixture.pathCostCalculator.calculateTotalCost(
        fixture.graph,
        Object.freeze(["A", "B", "C"]),
      );

      expect(result).toBe(5);
    });

    it("should return zero for a single node path", () => {
      const result = fixture.pathCostCalculator.calculateTotalCost(
        fixture.graph,
        Object.freeze(["A"]),
      );

      expect(result).toBe(0);
    });

    it("should throw when path contains a missing transition", () => {
      expect(() =>
        fixture.pathCostCalculator.calculateTotalCost(
          fixture.graph,
          Object.freeze(["C", "A"]),
        ),
      ).toThrowError("The supplied path contains a transition that does not exist in the graph.");
    });
  });

  describe("PathfindingRequestValidator", () => {
    it("should accept valid request", () => {
      const sut = new PathfindingRequestValidator<string>();

      expect(() => sut.validate(fixture.graph, fixture.requestFromAtoC)).not.toThrow();
    });

    it("should throw when start node does not exist", () => {
      const sut = new PathfindingRequestValidator<string>();
      const request = new PathfindingRequest<string>("X", "C");

      expect(() => sut.validate(fixture.graph, request)).toThrowError(
        "The start node does not exist in the graph.",
      );
    });

    it("should throw when goal node does not exist", () => {
      const sut = new PathfindingRequestValidator<string>();
      const request = new PathfindingRequest<string>("A", "X");

      expect(() => sut.validate(fixture.graph, request)).toThrowError(
        "The goal node does not exist in the graph.",
      );
    });
  });

  describe("ZeroHeuristic", () => {
    it("should always return zero", () => {
      const result = fixture.zeroHeuristic.estimate("A", "C");

      expect(result).toBe(0);
    });
  });

  describe("PathfindingAlgorithmBase", () => {
    it("should validate request before executing algorithm core", () => {
      const sut = fixture.createAlgorithm(() =>
        fixture.createFoundResult(Object.freeze(["A", "C"]), 5),
      );

      const result = sut.findPath(fixture.graph, fixture.requestFromAtoC);

      expect(fixture.requestValidator.invocationCount).toBe(1);
      expect(sut.invocationCount).toBe(1);
      expect(result.found).toBe(true);
      expect(result.path?.nodes).toEqual(["A", "C"]);
      expect(result.path?.totalCost).toBe(5);
    });

    it("should short-circuit when start and goal are the same", () => {
      const sut = fixture.createAlgorithm(() =>
        fixture.createFoundResult(Object.freeze(["A", "B"]), 2),
      );

      const result = sut.findPath(fixture.graph, fixture.requestFromAtoA);

      expect(fixture.requestValidator.invocationCount).toBe(1);
      expect(sut.invocationCount).toBe(0);
      expect(result.found).toBe(true);
      expect(result.path?.nodes).toEqual(["A"]);
      expect(result.path?.totalCost).toBe(0);
    });

    it("should propagate validation failure and not execute algorithm core", () => {
      const sut = fixture.createAlgorithm(() =>
        fixture.createFoundResult(Object.freeze(["A", "C"]), 5),
      );

      const invalidRequest = new PathfindingRequest<string>("X", "C");

      expect(() => sut.findPath(fixture.graph, invalidRequest)).toThrowError(
        "The start node does not exist in the graph.",
      );

      expect(fixture.requestValidator.invocationCount).toBe(1);
      expect(sut.invocationCount).toBe(0);
    });
  });

  describe("PathfindingDomainComposition", () => {
    it("should create domain services", () => {
      const sut = new PathfindingDomainComposition();

      const validator = sut.createRequestValidator<string>();
      const reconstructionService = sut.createPathReconstructionService<string>();
      const costCalculator = sut.createPathCostCalculator<string>();
      const heuristic = sut.createZeroHeuristic<string>();

      expect(validator).toBeInstanceOf(PathfindingRequestValidator<string>);
      expect(reconstructionService).toBeInstanceOf(PathReconstructionService<string>);
      expect(costCalculator).toBeInstanceOf(PathCostCalculator<string>);
      expect(heuristic).toBeInstanceOf(ZeroHeuristic<string>);
    });
  });
});