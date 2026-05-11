import { Vector2 } from "@monorepo/core-math";

export interface PhysicalObjectState {
  readonly startPosition: Vector2;
  readonly position: Vector2;
  readonly velocity: Vector2;
  readonly acceleration: Vector2;
}

export abstract class PhysicalObject {
  #startPosition = new Vector2(0, 0);
  #position = new Vector2(0, 0);
  #velocity = new Vector2(0, 0);
  #acceleration = new Vector2(0, 0);

  public getPosition(): Vector2 {
    return copyVector(this.#position);
  }

  public getStartPosition(): Vector2 {
    return copyVector(this.#startPosition);
  }

  public getAccelerationVector(): Vector2 {
    return copyVector(this.#acceleration);
  }

  protected getInitialVelocityVector(): Vector2 {
    return copyVector(this.#velocity);
  }

  protected resetPhysicalState(state: Omit<PhysicalObjectState, "position">): void {
    this.#startPosition = copyVector(state.startPosition);
    this.#position = copyVector(state.startPosition);
    this.#velocity = copyVector(state.velocity);
    this.#acceleration = copyVector(state.acceleration);
  }

  protected setPositionAt(elapsedSeconds: number): void {
    assertFiniteNumber(elapsedSeconds, "elapsedSeconds");

    this.#position = new Vector2(
      this.#startPosition.x +
        this.#velocity.x * elapsedSeconds +
        0.5 * this.#acceleration.x * elapsedSeconds * elapsedSeconds,
      this.#startPosition.y +
        this.#velocity.y * elapsedSeconds +
        0.5 * this.#acceleration.y * elapsedSeconds * elapsedSeconds,
    );
  }
}

export function copyVector(vector: Vector2): Vector2 {
  return new Vector2(vector.x, vector.y);
}

export function scaleVector(vector: Vector2, scale: number): Vector2 {
  assertFiniteNumber(scale, "scale");

  return new Vector2(vector.x * scale, vector.y * scale);
}

export function subtractVector(left: Vector2, right: Vector2): Vector2 {
  return new Vector2(left.x - right.x, left.y - right.y);
}

export function vectorLength(vector: Vector2): number {
  return Math.hypot(vector.x, vector.y);
}

export function normalizeVector(vector: Vector2): Vector2 {
  const length = vectorLength(vector);

  if (length === 0) {
    throw new RangeError("direction must not be a zero vector.");
  }

  return new Vector2(vector.x / length, vector.y / length);
}

export function distanceBetween(left: Vector2, right: Vector2): number {
  return vectorLength(subtractVector(left, right));
}

export function assertFiniteNumber(value: number, name: string): void {
  if (!Number.isFinite(value)) {
    throw new RangeError(`${name} must be finite.`);
  }
}

export function assertFiniteGreaterThan(value: number, name: string, minExclusive: number): void {
  if (!Number.isFinite(value) || value <= minExclusive) {
    throw new RangeError(`${name} must be greater than ${minExclusive}.`);
  }
}

export function assertFiniteGreaterThanOrEqual(
  value: number,
  name: string,
  minInclusive: number,
): void {
  if (!Number.isFinite(value) || value < minInclusive) {
    throw new RangeError(`${name} must be greater than or equal to ${minInclusive}.`);
  }
}