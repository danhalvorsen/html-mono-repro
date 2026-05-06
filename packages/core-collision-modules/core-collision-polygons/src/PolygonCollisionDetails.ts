import type { Vector2 } from "@monorepo/core-math";
import type { CollisionReference } from "./PolygonCollisionSystem.js";

export interface CollisionPair {
  readonly source: CollisionReference;
  readonly target: CollisionReference;
}

export class PolygonCollisionDetails {
  public readonly source: readonly CollisionReference[];
  public readonly target: readonly CollisionReference[];

  public constructor(
    source: readonly CollisionReference[],
    target: readonly CollisionReference[]
  ) {
    if (source.length !== target.length) {
      throw new RangeError("Collision details source and target must have the same length.");
    }

    this.source = Object.freeze([...source]);
    this.target = Object.freeze([...target]);
  }

  public static empty(): PolygonCollisionDetails {
    return new PolygonCollisionDetails([], []);
  }

  public static fromPair(
    source: CollisionReference,
    target: CollisionReference
  ): PolygonCollisionDetails {
    return new PolygonCollisionDetails([source], [target]);
  }

  public get count(): number {
    return this.source.length;
  }

  public get hasAny(): boolean {
    return this.count > 0;
  }

  public first(): CollisionPair | null {
    if (this.count === 0) {
      return null;
    }

    return this.pairAt(0);
  }

  public firstOrThrow(): CollisionPair {
    const first = this.first();

    if (!first) {
      throw new RangeError("Collision details contain no collision references.");
    }

    return first;
  }

  public pairAt(index: number): CollisionPair {
    const source = this.source[index];
    const target = this.target[index];

    if (!source || !target) {
      throw new RangeError(`Collision pair at index ${index} does not exist.`);
    }

    return { source, target };
  }

  public pairs(): readonly CollisionPair[] {
    const pairs: CollisionPair[] = [];

    for (let index = 0; index < this.count; index++) {
      pairs.push(this.pairAt(index));
    }

    return pairs;
  }

  public containsSourcePosition(position: Vector2, tolerance = 1e-9): boolean {
    return this.source.some((reference) =>
      reference.position?.equals(position, tolerance) === true
    );
  }

  public containsTargetPosition(position: Vector2, tolerance = 1e-9): boolean {
    return this.target.some((reference) =>
      reference.position?.equals(position, tolerance) === true
    );
  }

  public containsPosition(position: Vector2, tolerance = 1e-9): boolean {
    return (
      this.containsSourcePosition(position, tolerance) ||
      this.containsTargetPosition(position, tolerance)
    );
  }
}
