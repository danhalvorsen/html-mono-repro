import { describe, expect, it } from "vitest";
import { GridEdgeSide, UniformSamplingPolicy } from "../src/index.js";
import { ProgressiveGridFixture } from "./fixtures/ProgressiveGridFixture.js";

describe("ProgressiveGridBuilder", () => {
  it("aligns a vertical shared edge by upgrading both patches to the maximum y sample count", () => {
    const fixture = new ProgressiveGridFixture();
    const builder = fixture.createBuilder();

    const grid = builder.build([
      fixture.createPatch("left", 0, 1, 0, 1, 3, 3),
      fixture.createPatch("right", 1, 2, 0, 1, 5, 7),
    ]);

    const left = fixture.getRequiredPatch(grid, "left");
    const right = fixture.getRequiredPatch(grid, "right");

    fixture.expectEdgesToEqual(left, GridEdgeSide.Right, right, GridEdgeSide.Left);
    expect(left.getEdgeSamples(GridEdgeSide.Right)).toHaveLength(7);
    expect(right.getEdgeSamples(GridEdgeSide.Left)).toHaveLength(7);
  });

  it("aligns a horizontal shared edge by upgrading both patches to the maximum x sample count", () => {
    const fixture = new ProgressiveGridFixture();
    const builder = fixture.createBuilder();

    const grid = builder.build([
      fixture.createPatch("bottom", 0, 1, 0, 1, 4, 3),
      fixture.createPatch("top", 0, 1, 1, 2, 8, 5),
    ]);

    const bottom = fixture.getRequiredPatch(grid, "bottom");
    const top = fixture.getRequiredPatch(grid, "top");

    fixture.expectEdgesToEqual(bottom, GridEdgeSide.Top, top, GridEdgeSide.Bottom);
    expect(bottom.getEdgeSamples(GridEdgeSide.Top)).toHaveLength(8);
    expect(top.getEdgeSamples(GridEdgeSide.Bottom)).toHaveLength(8);
  });

  it("propagates edge resolution through chained neighbours", () => {
    const fixture = new ProgressiveGridFixture();
    const builder = fixture.createBuilder();

    const grid = builder.build([
      fixture.createPatch("a", 0, 1, 0, 1, 3, 3),
      fixture.createPatch("b", 1, 2, 0, 1, 3, 5),
      fixture.createPatch("c", 2, 3, 0, 1, 3, 9),
    ]);

    const a = fixture.getRequiredPatch(grid, "a");
    const b = fixture.getRequiredPatch(grid, "b");
    const c = fixture.getRequiredPatch(grid, "c");

    fixture.expectEdgesToEqual(a, GridEdgeSide.Right, b, GridEdgeSide.Left);
    fixture.expectEdgesToEqual(b, GridEdgeSide.Right, c, GridEdgeSide.Left);

    expect(a.getEdgeSamples(GridEdgeSide.Right)).toHaveLength(9);
    expect(b.getEdgeSamples(GridEdgeSide.Left)).toHaveLength(9);
    expect(b.getEdgeSamples(GridEdgeSide.Right)).toHaveLength(9);
    expect(c.getEdgeSamples(GridEdgeSide.Left)).toHaveLength(9);
  });

  it("keeps non-neighbouring patches independent", () => {
    const fixture = new ProgressiveGridFixture();
    const builder = fixture.createBuilder();

    const grid = builder.build([
      fixture.createPatch("a", 0, 1, 0, 1, 3, 3),
      fixture.createPatch("b", 3, 4, 0, 1, 5, 7),
    ]);

    const a = fixture.getRequiredPatch(grid, "a");
    const b = fixture.getRequiredPatch(grid, "b");

    expect(grid.getNeighbours()).toHaveLength(0);
    expect(a.getPoints()).toHaveLength(9);
    expect(b.getPoints()).toHaveLength(35);
  });

  it("creates deterministic row-major patch points", () => {
    const fixture = new ProgressiveGridFixture();
    const builder = fixture.createBuilder();

    const grid = builder.build([
      fixture.createPatch("patch", 0, 1, 0, 1, 3, 2),
    ]);

    const patch = fixture.getRequiredPatch(grid, "patch");

    expect(patch.getPoints()).toEqual([
      { x: 0, y: 0 },
      { x: 0.5, y: 0 },
      { x: 1, y: 0 },
      { x: 0, y: 1 },
      { x: 0.5, y: 1 },
      { x: 1, y: 1 },
    ]);
  });

  it("rejects duplicate patch ids", () => {
    const fixture = new ProgressiveGridFixture();
    const builder = fixture.createBuilder();

    expect(() =>
      builder.build([
        fixture.createPatch("same", 0, 1, 0, 1, 3, 3),
        fixture.createPatch("same", 1, 2, 0, 1, 3, 3),
      ]),
    ).toThrow("Duplicate grid patch definition id: same");
  });

  it("rejects invalid bounds", () => {
    const fixture = new ProgressiveGridFixture();
    const builder = fixture.createBuilder();

    expect(() =>
      builder.build([
        fixture.createPatch("invalid", 1, 1, 0, 1, 3, 3),
      ]),
    ).toThrow("Grid patch x0 must be lower than x1 for patch: invalid");
  });

  it("rejects invalid sample counts", () => {
    const fixture = new ProgressiveGridFixture();
    const builder = fixture.createBuilder();

    expect(() =>
      builder.build([
        fixture.createPatch("invalid", 0, 1, 0, 1, 1, 3),
      ]),
    ).toThrow("Grid patch xSamples must be an integer greater than or equal to 2.");
  });
});

describe("UniformSamplingPolicy", () => {
  it("creates inclusive uniform samples", () => {
    const policy = new UniformSamplingPolicy();

    expect(policy.createSamples(0, 10, 3)).toEqual([0, 5, 10]);
  });

  it("rejects non-increasing ranges", () => {
    const policy = new UniformSamplingPolicy();

    expect(() => policy.createSamples(1, 1, 3)).toThrow(
      "Sample start must be lower than sample end.",
    );
  });
});
