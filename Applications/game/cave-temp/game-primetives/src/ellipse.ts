import { Vector2 } from "@monorepo/core-math";

export class Ellipse {
  public readonly center: Vector2;
  public readonly radiusX: number;
  public readonly radiusY: number;

  public constructor(center: Vector2, radiusX: number, radiusY: number) {
    if (radiusX <= 0 || radiusY <= 0) {
      throw new RangeError("Ellipse radii must be positive.");
    }

    this.center = center.clone();
    this.radiusX = radiusX;
    this.radiusY = radiusY;
  }

  public withCenter(center: Vector2): Ellipse {
    return new Ellipse(center, this.radiusX, this.radiusY);
  }

  public withRadiusX(r: number): Ellipse {
    return new Ellipse(this.center, r, this.radiusY);
  }

  public withRadiusY(r: number): Ellipse {
    return new Ellipse(this.center, this.radiusX, r);
  }

  public contains(point: Vector2): boolean {
    const dx = (point.x - this.center.x) / this.radiusX;
    const dy = (point.y - this.center.y) / this.radiusY;
    return dx * dx + dy * dy <= 1;
  }
}
