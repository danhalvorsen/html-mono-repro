import type { GridPointProjectionContext } from "@monorepo/game-progressive-grid-threejs/src/index.js";
import type { HeightmapBounds } from "./HeightmapBounds.js";
import type { IGridPointUvMapper } from "./IGridPointUvMapper.js";
import type { UvCoordinate } from "./UvCoordinate.js";

export class BoundsGridPointUvMapper implements IGridPointUvMapper {
  private readonly bounds: HeightmapBounds;

  public constructor(bounds: HeightmapBounds) {
    this.assertBounds(bounds);
    this.bounds = bounds;
  }

  public map(context: GridPointProjectionContext): UvCoordinate {
    return {
      u: (context.point.x - this.bounds.minX) / (this.bounds.maxX - this.bounds.minX),
      v: (context.point.y - this.bounds.minY) / (this.bounds.maxY - this.bounds.minY),
    };
  }

  private assertBounds(bounds: HeightmapBounds): void {
    this.assertFinite(bounds.minX, "minX");
    this.assertFinite(bounds.maxX, "maxX");
    this.assertFinite(bounds.minY, "minY");
    this.assertFinite(bounds.maxY, "maxY");

    if (bounds.maxX <= bounds.minX) {
      throw new Error("Heightmap bounds maxX must be greater than minX.");
    }

    if (bounds.maxY <= bounds.minY) {
      throw new Error("Heightmap bounds maxY must be greater than minY.");
    }
  }

  private assertFinite(value: number, name: string): void {
    if (!Number.isFinite(value)) {
      throw new Error(`Heightmap bounds ${name} must be finite.`);
    }
  }
}
