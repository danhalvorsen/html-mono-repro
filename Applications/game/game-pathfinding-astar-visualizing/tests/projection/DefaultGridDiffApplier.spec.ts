import { describe, expect, it } from "vitest";
import { DefaultGridDiffApplier } from "../../src/projection/DefaultGridDiffApplier.js";
import { AstarVisualizerFixture } from "../fixtures/AstarVisualizerFixture.js";

describe("DefaultGridDiffApplier", () => {
  const fixture = new AstarVisualizerFixture();

  it("should apply a cell patch without mutating the original snapshot", () => {
    const applier = new DefaultGridDiffApplier();
    const snapshot = fixture.createSnapshot();
    const diff = fixture.createDiff();

    const result = applier.apply(snapshot, diff);

    expect(result[1]?.[1]).toStrictEqual({
      role: "empty",
      visitState: "open",
      g: 10,
      h: 20,
      f: 30,
      parentDirection: "north",
    });

    expect(snapshot[1]?.[1]).toStrictEqual(fixture.createEmptyCellState());
    expect(result).not.toBe(snapshot);
    expect(result[1]).not.toBe(snapshot[1]);
  });

  it("should keep missing patch fields unchanged", () => {
    const applier = new DefaultGridDiffApplier();
    const snapshot = fixture.createSnapshot();
    const first = applier.apply(snapshot, [
      {
        row: 1,
        col: 1,
        role: "start",
        visitState: "open",
        g: 1,
        h: 2,
        f: 3,
        parentDirection: "east",
      },
    ]);

    const result = applier.apply(first, [
      {
        row: 1,
        col: 1,
        visitState: "closed",
      },
    ]);

    expect(result[1]?.[1]).toStrictEqual({
      role: "start",
      visitState: "closed",
      g: 1,
      h: 2,
      f: 3,
      parentDirection: "east",
    });
  });

  it("should clear nullable fields when patch value is null", () => {
    const applier = new DefaultGridDiffApplier();
    const snapshot = fixture.createSnapshot();

    const prepared = applier.apply(snapshot, fixture.createDiff());

    const result = applier.apply(prepared, [
      {
        row: 1,
        col: 1,
        g: null,
        h: null,
        f: null,
        parentDirection: null,
      },
    ]);

    expect(result[1]?.[1]).toStrictEqual({
      role: "empty",
      visitState: "open",
      g: null,
      h: null,
      f: null,
      parentDirection: null,
    });
  });

  it("should apply patches in order where the last patch wins", () => {
    const applier = new DefaultGridDiffApplier();
    const snapshot = fixture.createSnapshot();

    const result = applier.apply(snapshot, [
      {
        row: 1,
        col: 1,
        visitState: "open",
      },
      {
        row: 1,
        col: 1,
        visitState: "closed",
      },
    ]);

    expect(result[1]?.[1]?.visitState).toBe("closed");
  });

  it("should throw when a patch targets a coordinate outside the snapshot", () => {
    const applier = new DefaultGridDiffApplier();
    const snapshot = fixture.createSnapshot();

    expect(() =>
      applier.apply(snapshot, [
        {
          row: 10,
          col: 0,
          visitState: "open",
        },
      ]),
    ).toThrow("Grid patch coordinate is outside the snapshot bounds.");
  });
});
