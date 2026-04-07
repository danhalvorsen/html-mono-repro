import type { IPoint3 } from "./IRectGeometryService.js";
import type { IRectTransform2D } from "./IRectTransform2D.js";

export class RectTransform2D implements IRectTransform2D {
  public readonly translateX: number;
  public readonly translateY: number;
  public readonly rotationDegrees: number;

  public constructor(translateX: number, translateY: number, rotationDegrees: number = 0) {
    RectTransform2D.assertFinite(translateX, "translateX");
    RectTransform2D.assertFinite(translateY, "translateY");
    RectTransform2D.assertFinite(rotationDegrees, "rotationDegrees");

    this.translateX = translateX;
    this.translateY = translateY;
    this.rotationDegrees = rotationDegrees;

    Object.freeze(this);
  }

  public apply(point: IPoint3): IPoint3 {
    const radians = (this.rotationDegrees * Math.PI) / 180;
    const cos = Math.cos(radians);
    const sin = Math.sin(radians);

    return Object.freeze({
      x: (point.x * cos) - (point.y * sin) + this.translateX,
      y: (point.x * sin) + (point.y * cos) + this.translateY,
      z: point.z,
    });
  }

  private static assertFinite(value: number, name: string): void {
    if (!Number.isFinite(value)) {
      throw new Error(`${name} must be finite.`);
    }
  }
}
