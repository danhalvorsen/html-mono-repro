import { Vector2 } from "@monorepo/core-math";

export class Rectangle {
  public readonly topLeft: Vector2;
  public readonly dimension: Vector2;

  public constructor(topLeft: Vector2, width: number, height: number) {
    if (width <= 0 || height <= 0) {
      throw new RangeError("Rectangle dimensions must be positive.");
    }

    this.topLeft = topLeft.clone();
    this.dimension = new Vector2(width, height);
  }

  public get width(): number {
    return this.dimension.x;
  }

  public get height(): number {
    return this.dimension.y;
  }

  public withTopLeft(topLeft: Vector2): Rectangle {
    return new Rectangle(topLeft, this.width, this.height);
  }

  public withWidth(width: number): Rectangle {
    return new Rectangle(this.topLeft, width, this.height);
  }

  public withHeight(height: number): Rectangle {
    return new Rectangle(this.topLeft, this.width, height);
  }

  public contains(point: Vector2): boolean {
    return (
      point.x >= this.topLeft.x &&
      point.x <= this.topLeft.x + this.width &&
      point.y >= this.topLeft.y &&
      point.y <= this.topLeft.y + this.height
    );
  }
}
