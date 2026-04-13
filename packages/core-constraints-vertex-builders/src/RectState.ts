import type { IRectSize } from "./IRectSize.js";
import type { IRectState } from "./IRectState.js";
import type { RectSemanticPoint } from "./RectSemanticPoint.js";
import { RectSemanticRegistry } from "./RectSemanticRegistry.js";

export class RectState implements IRectState {
  public readonly centerX: number;
  public readonly centerY: number;
  public readonly centerZ: number;
  public readonly size: IRectSize;
  public readonly rotationDegrees: number;
  public readonly pivot: RectSemanticPoint | undefined;

  public constructor(
    centerX: number,
    centerY: number,
    centerZ: number,
    size: IRectSize,
    rotationDegrees: number = 0,
    pivot: RectSemanticPoint | undefined = undefined,
  ) {
    RectState.assertFinite(centerX, "centerX");
    RectState.assertFinite(centerY, "centerY");
    RectState.assertFinite(centerZ, "centerZ");
    RectState.assertPositiveFinite(size.width, "width");
    RectState.assertPositiveFinite(size.height, "height");
    RectState.assertPositiveFinite(size.depth, "depth");
    RectState.assertFinite(rotationDegrees, "rotationDegrees");

    if (pivot !== undefined && !RectSemanticRegistry.isValid(pivot)) {
      throw new Error("pivot must be a valid semantic point.");
    }

    this.centerX = centerX;
    this.centerY = centerY;
    this.centerZ = centerZ;
    this.size = Object.freeze({
      width: size.width,
      height: size.height,
      depth: size.depth,
    });
    this.rotationDegrees = rotationDegrees;
    this.pivot = pivot;

    Object.freeze(this);
  }

  public static create(size: IRectSize): RectState {
    return new RectState(0, 0, 0, size);
  }

  public movedBy(deltaX: number, deltaY: number, deltaZ: number): RectState {
    RectState.assertFinite(deltaX, "deltaX");
    RectState.assertFinite(deltaY, "deltaY");
    RectState.assertFinite(deltaZ, "deltaZ");

    return new RectState(
      this.centerX + deltaX,
      this.centerY + deltaY,
      this.centerZ + deltaZ,
      this.size,
      this.rotationDegrees,
      this.pivot,
    );
  }

  public movedTo(centerX: number, centerY: number, centerZ: number): RectState {
    return new RectState(
      centerX,
      centerY,
      centerZ,
      this.size,
      this.rotationDegrees,
      this.pivot,
    );
  }

  public rotatedAround(pivot: RectSemanticPoint, angleDegrees: number): RectState {
    return new RectState(
      this.centerX,
      this.centerY,
      this.centerZ,
      this.size,
      angleDegrees,
      pivot,
    );
  }

  private static assertFinite(value: number, name: string): void {
    if (!Number.isFinite(value)) {
      throw new Error(`${name} must be finite.`);
    }
  }

  private static assertPositiveFinite(value: number, name: string): void {
    if (!Number.isFinite(value) || value <= 0) {
      throw new Error(`${name} must be > 0.`);
    }
  }
}
