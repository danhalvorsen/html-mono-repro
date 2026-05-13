import { Vector2 } from "@monorepo/core-math";

import { CollisionDetection } from "../collision/CollisionDetection.ts";
import { CollisionObject } from "../collision/CollisionObject.ts";
import { MovemementStrategy } from "./MovementStrategy.ts";

export class BouncingMovementStrategy extends MovemementStrategy {
  public container: CollisionObject = new CollisionObject(
    new Vector2(0, 0),
    new Vector2(0, 0),
  );

  public collisionDetection: CollisionDetection = new CollisionDetection();
  public size: Vector2 = new Vector2(20, 50);

  public constructor() {
    super();

    this.position = new Vector2(18, 18);
    this.direction = this.normalizeVector(new Vector2(1, 1), new Vector2(1, 0));
    this.initialVelocity = new Vector2(180, 140);
    this.velocity = this.initialVelocity;
    this.acceleration = new Vector2(0, 0);
  }

  public override calculate(deltaSeconds: number): void {
    const safeDeltaSeconds = this.getSafeDeltaSeconds(deltaSeconds);

    if (!this.isStarted) {
      this.velocity = this.initialVelocity;
      this.direction = this.calculateDirection(this.velocity, this.direction);
      this.isStarted = true;
    }

    this.position = this.calculateNextPosition(safeDeltaSeconds);
    this.velocity = this.calculateNextVelocity(safeDeltaSeconds);

    const collision = this.collisionDetection.detectInside(
      new CollisionObject(this.position, this.size),
      this.container,
    );

    this.position = collision.correctedPosition;

    if (collision.hitHorizontalEdge) {
      this.direction = new Vector2(-this.direction.x, this.direction.y);
      this.velocity = new Vector2(-this.velocity.x, this.velocity.y);
    }

    if (collision.hitVerticalEdge) {
      this.direction = new Vector2(this.direction.x, -this.direction.y);
      this.velocity = new Vector2(this.velocity.x, -this.velocity.y);
    }

    this.direction = this.calculateDirection(this.velocity, this.direction);
  }
}

// Compatibility with the spelling from the requested sketch.
export class BoucingMovementStrategy extends BouncingMovementStrategy {}
