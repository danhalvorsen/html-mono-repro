// ====================================================================================
// FILE: fixture/PlacementFixture.ts
// ====================================================================================

import { BoundingBox2D, Vector2 } from "@monorepo/core-math";
import type { IPlacementContext } from "../../src/index.js";

export class PlacementFixture {
  public createBox(
    minX: number,
    minY: number,
    maxX: number,
    maxY: number,
  ): BoundingBox2D {
    return new BoundingBox2D(
      new Vector2(minX, minY),
      new Vector2(maxX, maxY),
    );
  }

  public createSource(
    minX = 0,
    minY = 0,
    maxX = 1,
    maxY = 1,
  ): BoundingBox2D {
    return this.createBox(minX, minY, maxX, maxY);
  }

  public createTarget(
    minX = 0,
    minY = 0,
    maxX = 10,
    maxY = 10,
  ): BoundingBox2D {
    return this.createBox(minX, minY, maxX, maxY);
  }

  public createContext(
    source: BoundingBox2D,
    target: BoundingBox2D,
  ): IPlacementContext {
    return { source, target };
  }
}