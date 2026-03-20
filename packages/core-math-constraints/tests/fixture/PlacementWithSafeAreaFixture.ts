// ====================================================================================
// FILE: fixture/PlacementWithSafeAreaFixture.ts
// ====================================================================================

import { BoundingBox2D, Vector2 } from "@monorepo/core-math";
import type { IPlacementWithSafeAreaContext } from "../../src/index.js";
import { PlacementFixture } from "./PlacementFixture.js";

export class PlacementWithSafeAreaFixture {
  private readonly base = new PlacementFixture();

  public createSafeArea(
    source: BoundingBox2D,
    margin: number,
  ): BoundingBox2D {
    return new BoundingBox2D(
      new Vector2(source.min.x - margin, source.min.y - margin),
      new Vector2(source.max.x + margin, source.max.y + margin),
    );
  }

  public createContext(
    source: BoundingBox2D,
    target: BoundingBox2D,
    margin: number,
  ): IPlacementWithSafeAreaContext {
    const safeArea = this.createSafeArea(source, margin);

    return {
      source,
      target,
      safeArea,
    };
  }
}