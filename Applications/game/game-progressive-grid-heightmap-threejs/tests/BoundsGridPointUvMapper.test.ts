import type { IGridPatch } from "@monorepo/game-progressive-grid";
import type { GridPointProjectionContext } from "@monorepo/game-progressive-grid-threejs";
import { describe, expect, it } from "vitest";
import { BoundsGridPointUvMapper } from "../src/index.js";

describe("BoundsGridPointUvMapper", () => {
  function createContext(x: number, y: number): GridPointProjectionContext {
    return {
      patch: { id: "patch", getPoints: () => [] } as unknown as IGridPatch,
      point: { x, y },
      columnIndex: 0,
      rowIndex: 0,
      columnCount: 2,
      rowCount: 2,
      linearIndex: 0,
    };
  }

  it("maps grid coordinates to normalized UV coordinates", () => {
    const mapper = new BoundsGridPointUvMapper({
      minX: 0,
      maxX: 10,
      minY: 10,
      maxY: 20,
    });

    expect(mapper.map(createContext(5, 15))).toEqual({
      u: 0.5,
      v: 0.5,
    });
  });

  it("rejects empty x bounds", () => {
    expect(() => new BoundsGridPointUvMapper({
      minX: 1,
      maxX: 1,
      minY: 0,
      maxY: 1,
    })).toThrow("Heightmap bounds maxX must be greater than minX.");
  });
});