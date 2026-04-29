// core-graph-pathfinding-domain/tests/core-graph-pathfinding-domain.spec.ts
import { beforeEach, describe, expect, it } from "vitest";  
import { PathfindingRequest } from "../src/PathfindingRequest.js";
import { PathNeighbor } from "../src/PathNeighbor.js";
import { PathfindingResult } from "../src/PathfindingResult.js";
import { Path } from "../src/Path.js";
import { PathfindingDomainFixture } from "./PathfindingDomainFixture.js";
 
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

});