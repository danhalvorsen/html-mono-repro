import { Vector2 } from "@monorepo/core-math";
import { CollisionObject } from "../collision/CollisionObject.ts";
import { DirectionalMovementPlan } from "./DirectionalMovementPlan.ts";
import { MovemementStrategy } from "./MovementStrategy.ts";

export class GravityFallingMovementStrategy extends MovemementStrategy {
  private static readonly MinSpeedPixelsPerSecond: number = 0;
  private static readonly MaxSpeedPixelsPerSecond: number = 800;
  private static readonly SpeedPixelsPerSecondPerMillisecond: number = 0.8;
  private static readonly AccelerationPixelsPerSecondSquared: number = 320;

  public static createFromHoldDuration(
    heldMs: number
  ): GravityFallingMovementStrategy {
    const strategy = new GravityFallingMovementStrategy();

    strategy.movementPlan = new DirectionalMovementPlan(
      new Vector2(0, 1),
      GravityFallingMovementStrategy.calculateInitialSpeed(heldMs),
      GravityFallingMovementStrategy.AccelerationPixelsPerSecondSquared
    );

    return strategy;
  }

  public container: CollisionObject = new CollisionObject(
    new Vector2(0, 0),
    new Vector2(0, 0)
  );

  public movementPlan: DirectionalMovementPlan = new DirectionalMovementPlan();

  public size: Vector2 = new Vector2(16, 36);
  public inset: number = 4;

  private activeMovementPlan: DirectionalMovementPlan | null = null;

  public override calculate(deltaSeconds: number): void {
    this.applyMovementPlan();

    if (this.isCompleted) {
      return;
    }

    const safeDeltaSeconds = this.getSafeDeltaSeconds(deltaSeconds);

    this.position = this.calculateNextPosition(safeDeltaSeconds);
    this.velocity = this.calculateNextVelocity(safeDeltaSeconds);
    this.direction = this.calculateDirection(this.velocity, this.direction);

    if (this.hasReachedEndEdge()) {
      this.isCompleted = true;
    }
  }

  private static calculateInitialSpeed(heldMs: number): number {
    const safeHeldMs = Number.isFinite(heldMs) ? Math.max(0, heldMs) : 0;

    const speed = safeHeldMs *
      GravityFallingMovementStrategy.SpeedPixelsPerSecondPerMillisecond;

    return Math.min(
      GravityFallingMovementStrategy.MaxSpeedPixelsPerSecond,
      Math.max(
        GravityFallingMovementStrategy.MinSpeedPixelsPerSecond,
        speed
      )
    );
  }

  private applyMovementPlan(): void {
    if (this.activeMovementPlan === this.movementPlan && this.isStarted) {
      return;
    }

    this.activeMovementPlan = this.movementPlan;
    this.direction = this.movementPlan.direction;
    this.initialVelocity = this.movementPlan.createInitialVelocity();
    this.velocity = this.initialVelocity;
    this.acceleration = this.movementPlan.createAcceleration();
    this.position = this.createStartPosition(this.direction);
    this.isStarted = true;
    this.isCompleted = false;
  }

  private createStartPosition(direction: Vector2): Vector2 {
    return new Vector2(
      this.getStartX(direction),
      this.getStartY(direction)
    );
  }

  private getStartX(direction: Vector2): number {
    if (direction.x > 0) {
      return this.container.left + this.inset;
    }

    if (direction.x < 0) {
      return this.container.right - this.size.x - this.inset;
    }

    return this.container.left + this.container.size.x / 2 - this.size.x / 2;
  }

  private getStartY(direction: Vector2): number {
    if (direction.y > 0) {
      return this.container.top + this.inset;
    }

    if (direction.y < 0) {
      return this.container.bottom - this.size.y - this.inset;
    }

    return this.container.top + this.container.size.y / 2 - this.size.y / 2;
  }

  private hasReachedEndEdge(): boolean {
    if (this.direction.x > 0 &&
      this.position.x + this.size.x >= this.container.right) {
      return true;
    }

    if (this.direction.x < 0 && this.position.x <= this.container.left) {
      return true;
    }

    if (this.direction.y > 0 &&
      this.position.y + this.size.y >= this.container.bottom) {
      return true;
    }

    if (this.direction.y < 0 && this.position.y <= this.container.top) {
      return true;
    }

    return false;
  }
}
