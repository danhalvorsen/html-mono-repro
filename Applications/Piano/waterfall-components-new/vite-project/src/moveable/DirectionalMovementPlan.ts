import { Vector2 } from "@monorepo/core-math";


export class DirectionalMovementPlan {
  public readonly direction: Vector2;
  public readonly initialSpeedPixelsPerSecond: number;
  public readonly accelerationPixelsPerSecondSquared: number;

  public constructor(
    direction: Vector2 = new Vector2(0, 1),
    initialSpeedPixelsPerSecond: number = 0,
    accelerationPixelsPerSecondSquared: number = 320
  ) {
    this.direction = DirectionalMovementPlan.normalize(direction);
    this.initialSpeedPixelsPerSecond = initialSpeedPixelsPerSecond;
    this.accelerationPixelsPerSecondSquared =
      accelerationPixelsPerSecondSquared;
  }

  public createInitialVelocity(): Vector2 {
    return new Vector2(
      this.direction.x * this.initialSpeedPixelsPerSecond,
      this.direction.y * this.initialSpeedPixelsPerSecond
    );
  }

  public createAcceleration(): Vector2 {
    return new Vector2(
      this.direction.x * this.accelerationPixelsPerSecondSquared,
      this.direction.y * this.accelerationPixelsPerSecondSquared
    );
  }

  private static normalize(vector: Vector2): Vector2 {
    const length = Math.hypot(vector.x, vector.y);

    if (length === 0) {
      return new Vector2(0, 1);
    }

    return new Vector2(vector.x / length, vector.y / length);
  }
}
