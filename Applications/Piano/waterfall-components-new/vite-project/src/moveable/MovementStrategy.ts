import { Vector2 } from "@monorepo/core-math";

import type { IMovemementStrategy } from "./IMovemementStrategy.ts";

export abstract class MovemementStrategy implements IMovemementStrategy {
  public position: Vector2 = new Vector2(0, 0);
  public direction: Vector2 = new Vector2(0, 0);
  public velocity: Vector2 = new Vector2(0, 0);
  public initialVelocity: Vector2 = new Vector2(0, 0);
  public acceleration: Vector2 = new Vector2(0, 0);
  public isStarted: boolean = false;
  public isCompleted: boolean = false;

  public abstract calculate(deltaSeconds: number): void;

  protected calculateNextPosition(deltaSeconds: number): Vector2 {
    return new Vector2(
      this.position.x +
        this.velocity.x * deltaSeconds +
        0.5 * this.acceleration.x * deltaSeconds * deltaSeconds,
      this.position.y +
        this.velocity.y * deltaSeconds +
        0.5 * this.acceleration.y * deltaSeconds * deltaSeconds,
    );
  }

  protected calculateNextVelocity(deltaSeconds: number): Vector2 {
    return new Vector2(
      this.velocity.x + this.acceleration.x * deltaSeconds,
      this.velocity.y + this.acceleration.y * deltaSeconds,
    );
  }

  protected calculateDirection(
    velocity: Vector2,
    fallbackDirection: Vector2,
  ): Vector2 {
    const length = Math.hypot(velocity.x, velocity.y);

    if (length === 0) {
      return fallbackDirection;
    }

    return new Vector2(velocity.x / length, velocity.y / length);
  }

  protected normalizeVector(vector: Vector2, fallback: Vector2): Vector2 {
    const length = Math.hypot(vector.x, vector.y);

    if (length === 0) {
      return fallback;
    }

    return new Vector2(vector.x / length, vector.y / length);
  }

  protected getSafeDeltaSeconds(deltaSeconds: number): number {
    if (!Number.isFinite(deltaSeconds)) {
      return 0;
    }

    return Math.max(0, deltaSeconds);
  }
}
