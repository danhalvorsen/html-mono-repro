import { Vector3 } from "three";
import type {
  GridPointProjectionContext,
  IGridPointProjector,
} from "@monorepo/game-progressive-grid-threejs/src/index.js";
import { BoundsGridPointUvMapper } from "./BoundsGridPointUvMapper.js";
import { HeightAxis } from "./HeightAxis.js";
import type { IHeightSampler } from "./IHeightSampler.js";
import type { ImageHeightmapProjectorOptions } from "./ImageHeightmapProjectorOptions.js";

export class ImageHeightmapProjector implements IGridPointProjector {
  private readonly sampler: IHeightSampler;
  private readonly amplitude: number;
  private readonly baseHeight: number;
  private readonly heightAxis: NonNullable<ImageHeightmapProjectorOptions["heightAxis"]>;
  private readonly uvMapper: NonNullable<ImageHeightmapProjectorOptions["uvMapper"]>;

  public constructor(
    sampler: IHeightSampler,
    options: ImageHeightmapProjectorOptions = {},
  ) {
    this.assertFinite(options.amplitude ?? 1, "amplitude");
    this.assertFinite(options.baseHeight ?? 0, "baseHeight");

    this.sampler = sampler;
    this.amplitude = options.amplitude ?? 1;
    this.baseHeight = options.baseHeight ?? 0;
    this.heightAxis = options.heightAxis ?? HeightAxis.Z;
    this.uvMapper = options.uvMapper ?? new BoundsGridPointUvMapper({
      minX: 0,
      maxX: 1,
      minY: 0,
      maxY: 1,
    });
  }

  public project(context: GridPointProjectionContext): Vector3 {
    const uv = this.uvMapper.map(context);
    const height = this.baseHeight + this.sampler.sample(uv) * this.amplitude;

    switch (this.heightAxis) {
      case HeightAxis.X:
        return new Vector3(height, context.point.x, context.point.y);

      case HeightAxis.Y:
        return new Vector3(context.point.x, height, context.point.y);

      case HeightAxis.Z:
        return new Vector3(context.point.x, context.point.y, height);
    }
  }

  private assertFinite(value: number, name: string): void {
    if (!Number.isFinite(value)) {
      throw new Error(`Heightmap projector ${name} must be finite.`);
    }
  }
}
