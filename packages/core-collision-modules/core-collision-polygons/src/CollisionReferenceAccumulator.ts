import { type Vector2 } from "@monorepo/core-math";
import type { CollisionReference } from "./PolygonCollisionContracts.js";
import { PolygonCollisionDetails } from "./PolygonCollisionDetails.js";

export class CollisionReferenceAccumulator {
  private readonly sourceReferences: CollisionReference[] = [];
  private readonly targetReferences: CollisionReference[] = [];

  public add(
    source: CollisionReference,
    target: CollisionReference,
    tolerance: number
  ): void {
    if (!source.position) {
      return;
    }

    const alreadyExists = this.sourceReferences.some((reference) =>
      reference.position?.equals(source.position as Vector2, tolerance) === true
    );

    if (alreadyExists) {
      return;
    }

    this.sourceReferences.push(source);
    this.targetReferences.push(target);
  }

  public get hasAny(): boolean {
    return this.sourceReferences.length > 0;
  }

  public toDetails(): PolygonCollisionDetails {
    return new PolygonCollisionDetails(this.sourceReferences, this.targetReferences);
  }
}
