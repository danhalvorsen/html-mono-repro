import type { IGridPatch } from "@monorepo/game-progressive-grid";
import type { GridPointProjectionContext } from "@monorepo/game-progressive-grid-threejs";
import { describe, expect, it } from "vitest";
import {
  HeightAxis,
  ImageHeightmapProjector,
  type IHeightSampler,
  type UvCoordinate,
} from "../src/index.js";

class ConstantHeightSampler implements IHeightSampler {
  private readonly value: number;

  public constructor(value: number) {
    this.value = value;
  }

  public sample(_uv: UvCoordinate): number {
    return this.value;
  }
}

describe("ImageHeightmapProjector", () => {
  function createContext(): GridPointProjectionContext {
    return {
      patch: { id: "patch", getPoints: () => [] } as unknown as IGridPatch,
      point: { x: 10, y: 20 },
      columnIndex: 0,
      rowIndex: 0,
      columnCount: 2,
      rowCount: 2,
      linearIndex: 0,
    };
  }

  it("projects height to z by default", () => {
    const projector = new ImageHeightmapProjector(new ConstantHeightSampler(0.25), {
      amplitude: 10,
    });

    const projected = projector.project(createContext());

    expect(projected.x).toBe(10);
    expect(projected.y).toBe(20);
    expect(projected.z).toBe(2.5);
  });

  it("can project height to y", () => {
    const projector = new ImageHeightmapProjector(new ConstantHeightSampler(0.25), {
      amplitude: 10,
      heightAxis: HeightAxis.Y,
    });

    const projected = projector.project(createContext());

    expect(projected.x).toBe(10);
    expect(projected.y).toBe(2.5);
    expect(projected.z).toBe(20);
  });
});