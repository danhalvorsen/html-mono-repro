import { describe, expect, it } from "vitest";
import { AstarPathfinder } from "../src/index.js";
import { AstarFixture } from "./fixtures/AstarFixture.js";

describe("AstarPathfinder", () => {
  const fixture = new AstarFixture();

  it("should create a valid result when input is valid", () => {
    const pathfinder = new AstarPathfinder();

    const result = pathfinder.findPath(
      fixture.createRequest({
        start: fixture.createCoordinate(0, 0),
        goal: fixture.createCoordinate(4, 0),
      }),
    );

    expect(result.kind).toBe("path-found");
    if (result.kind !== "path-found") {
      return;
    }

    expect(result.path.length).toBe(5);
    expect(result.path[0]).toStrictEqual({ row: 0, col: 0 });
    expect(result.path[result.path.length - 1]).toStrictEqual({ row: 4, col: 0 });
    expect(result.totalCost).toBe(4);
  });

  it("should return deterministic output for known input", () => {
    const pathfinder = new AstarPathfinder();
    const request = fixture.createRequest({
      rows: 3,
      cols: 3,
      start: fixture.createCoordinate(0, 0),
      goal: fixture.createCoordinate(2, 2),
      settings: fixture.createSettings({ movementMode: "four-way" }),
    });

    const first = pathfinder.findPath(request);
    const second = pathfinder.findPath(request);

    expect(first).toStrictEqual(second);
  });

  it("should reject invalid state transitions when start is outside bounds", () => {
    const pathfinder = new AstarPathfinder();

    expect(() =>
      pathfinder.findPath(
        fixture.createRequest({
          start: fixture.createCoordinate(-1, 0),
        }),
      )).toThrow("Start coordinate is outside the grid bounds.");
  });

  it("should reject blocked start or goal", () => {
    const pathfinder = new AstarPathfinder();

    const blocked = fixture.createBlockedSet([
      fixture.createCoordinate(0, 0),
    ]);

    expect(() =>
      pathfinder.findPath(
        fixture.createRequest({
          blocked,
        }),
      )).toThrow("Start or goal coordinate is blocked.");
  });

  it("should preserve corner-cutting invariant when disabled", () => {
    const pathfinder = new AstarPathfinder();

    const blocked = fixture.createBlockedSet([
      fixture.createCoordinate(0, 1),
      fixture.createCoordinate(1, 0),
    ]);

    const result = pathfinder.findPath(
      fixture.createRequest({
        rows: 3,
        cols: 3,
        start: fixture.createCoordinate(0, 0),
        goal: fixture.createCoordinate(1, 1),
        blocked,
        settings: fixture.createSettings({
          movementMode: "eight-way",
          allowCornerCutting: false,
        }),
      }),
    );

    expect(result.kind).toBe("no-path");
  });

  it("should delegate to configured traversal cost policy", () => {
    const pathfinder = new AstarPathfinder();

    const expensiveCell = "2,1";

    const result = pathfinder.findPath(
      fixture.createRequest({
        rows: 5,
        cols: 3,
        start: fixture.createCoordinate(0, 1),
        goal: fixture.createCoordinate(4, 1),
        settings: fixture.createSettings({ movementMode: "four-way" }),
        traversalCost: (coordinate) =>
          `${coordinate.row},${coordinate.col}` === expensiveCell ? 50 : 1,
      }),
    );

    expect(result.kind).toBe("path-found");
    if (result.kind !== "path-found") {
      return;
    }

    expect(result.path).not.toContainEqual({ row: 2, col: 1 });
  });

  it("should return no-path when goal is fully enclosed", () => {
    const pathfinder = new AstarPathfinder();

    const blocked = fixture.createBlockedSet([
      fixture.createCoordinate(1, 2),
      fixture.createCoordinate(2, 1),
      fixture.createCoordinate(3, 2),
      fixture.createCoordinate(2, 3),
    ]);

    const result = pathfinder.findPath(
      fixture.createRequest({
        rows: 5,
        cols: 5,
        start: fixture.createCoordinate(0, 0),
        goal: fixture.createCoordinate(2, 2),
        blocked,
      }),
    );

    expect(result).toStrictEqual({
      kind: "no-path",
      path: null,
      totalCost: null,
      evaluatedNodes: result.evaluatedNodes,
    });
    expect(result.evaluatedNodes).toBeGreaterThan(0);
  });

  it("should return immediate completion when start equals goal", () => {
    const pathfinder = new AstarPathfinder();

    const result = pathfinder.findPath(
      fixture.createRequest({
        start: fixture.createCoordinate(2, 2),
        goal: fixture.createCoordinate(2, 2),
      }),
    );

    expect(result).toStrictEqual({
      kind: "path-found",
      path: [{ row: 2, col: 2 }],
      totalCost: 0,
      evaluatedNodes: 0,
    });
  });
});
