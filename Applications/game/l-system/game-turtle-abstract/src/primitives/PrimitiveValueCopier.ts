import type { FillStyle } from "../styles/FillStyle.js";
import type { StrokeStyle } from "../styles/StrokeStyle.js";
import type { Vector3 } from "../vectors/Vector3.js";
import type { PrimitiveMetadata } from "./PrimitiveMetadata.js";

export class PrimitiveValueCopier {
  public copyVector(vector: Vector3): Vector3 {
    return Object.freeze({
      x: this.normalizeZero(vector.x),
      y: this.normalizeZero(vector.y),
      z: this.normalizeZero(vector.z),
    });
  }

  public copyStroke(stroke: StrokeStyle): StrokeStyle {
    return Object.freeze({
      color: stroke.color,
      width: stroke.width,
    });
  }

  public copyFill(fill: FillStyle): FillStyle {
    return Object.freeze({
      color: fill.color,
    });
  }

  public copyMetadata(metadata: PrimitiveMetadata): PrimitiveMetadata {
    return Object.freeze({
      ...(metadata.id === undefined ? {} : { id: metadata.id }),
      ...(metadata.tags === undefined ? {} : { tags: Object.freeze([...metadata.tags]) }),
      ...(metadata.layer === undefined ? {} : { layer: metadata.layer }),
      ...(metadata.userData === undefined
        ? {}
        : { userData: Object.freeze({ ...metadata.userData }) }),
    });
  }

  private normalizeZero(value: number): number {
    return Object.is(value, -0) || Math.abs(value) < 1e-12 ? 0 : value;
  }
}