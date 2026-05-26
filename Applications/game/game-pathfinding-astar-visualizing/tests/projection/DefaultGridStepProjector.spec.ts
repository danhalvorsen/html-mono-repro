import { describe, expect, it } from "vitest";
import { DefaultGridStepProjector } from "../../src/projection/DefaultGridStepProjector.js";
import { AstarVisualizerFixture } from "../fixtures/AstarVisualizerFixture.js";

describe("DefaultGridStepProjector", () => {
  const fixture = new AstarVisualizerFixture();

  it("should project a node-opened step into an open cell diff", () => {
    const projector = new DefaultGridStepProjector();

    const result = projector.project({
      ...fixture.createStartedStep(),
      kind: "node-opened",
      coordinate: { row: 1, col: 2 },
      costs: {
        g: 4,
        h: 5,
        f: 9,
      },
      parent: { row: 1, col: 1 },
    });

    expect(result).toStrictEqual([
      {
        row: 1,
        col: 2,
        visitState: "open",
        g: 4,
        h: 5,
        f: 9,
        parentDirection: "west",
      },
    ]);
  });

  it("should project a node-closed step into a closed cell diff", () => {
    const projector = new DefaultGridStepProjector();

    const result = projector.project({
      ...fixture.createStartedStep(),
      kind: "node-closed",
      coordinate: { row: 1, col: 1 },
      current: { row: 1, col: 1 },
    });

    expect(result).toStrictEqual([
      {
        row: 1,
        col: 1,
        visitState: "closed",
      },
    ]);
  });

  it("should project a path-found step into ordered path cell diffs", () => {
    const projector = new DefaultGridStepProjector();

    const result = projector.project(fixture.createPathFoundStep());

    expect(result).toStrictEqual([
      {
        row: 0,
        col: 0,
        visitState: "path",
      },
      {
        row: 1,
        col: 1,
        visitState: "path",
      },
      {
        row: 2,
        col: 2,
        visitState: "path",
      },
    ]);
  });

  it("should return an empty diff for global no-path steps", () => {
    const projector = new DefaultGridStepProjector();

    const result = projector.project({
      ...fixture.createStartedStep(),
      kind: "no-path",
    });

    expect(result).toStrictEqual([]);
  });

  it("should return an empty diff for started steps", () => {
    const projector = new DefaultGridStepProjector();

    const result = projector.project(fixture.createStartedStep());

    expect(result).toStrictEqual([]);
  });

  it("should project a cost-updated step with only costs and parent direction", () => {
    const projector = new DefaultGridStepProjector();

    const result = projector.project({
      ...fixture.createStartedStep(),
      kind: "cost-updated",
      coordinate: { row: 2, col: 2 },
      costs: { g: 7, h: 4, f: 11 },
      parent: { row: 1, col: 2 },
    });

    expect(result).toStrictEqual([
      {
        row: 2,
        col: 2,
        g: 7,
        h: 4,
        f: 11,
        parentDirection: "north",
      },
    ]);
  });

  it("should throw when parent is not adjacent to projected coordinate", () => {
    const projector = new DefaultGridStepProjector();

    expect(() =>
      projector.project({
        ...fixture.createStartedStep(),
        kind: "node-opened",
        coordinate: { row: 0, col: 0 },
        costs: { g: 1, h: 1, f: 2 },
        parent: { row: 2, col: 2 },
      }),
    ).toThrow("Parent coordinate must be adjacent to the projected coordinate.");
  });
});
