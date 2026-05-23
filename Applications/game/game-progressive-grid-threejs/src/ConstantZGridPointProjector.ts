import { Vector3 } from "three";
import type { GridPointProjectionContext } from "./GridPointProjectionContext.js";
import type { IGridPointProjector } from "./IGridPointProjector.js";

export class ConstantZGridPointProjector implements IGridPointProjector {
  private readonly z: number;

  public constructor(z = 0) {
    if (!Number.isFinite(z)) {
      throw new Error("Projection z value must be finite.");
    }

    this.z = z;
  }

  public project(context: GridPointProjectionContext): Vector3 {
    return new Vector3(context.point.x, context.point.y, this.z);
  }
}
