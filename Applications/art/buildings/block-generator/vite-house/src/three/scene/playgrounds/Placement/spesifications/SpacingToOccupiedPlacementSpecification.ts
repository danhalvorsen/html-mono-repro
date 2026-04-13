import { Vector2Gpu } from "@monorepo/core-math-gpu";
import { type IBoxModule, type IBox2, Aabb2 } from "@monorepo/core-math-rectangle";
import type { IPlacementContext } from "@monorepo/core-rectangle-placement";

export class SpacingToOccupiedPlacementSpecification {
  public constructor(
    private readonly boxModule: IBoxModule,
    private readonly spacing: number
  ) { }

  public isSatisfiedBy(context: IPlacementContext): boolean {
    const collision = this.boxModule.createBox2Collision();

    for (const occupied of context.occupied) {
      const expandedBounds = this.createExpandedBounds(occupied.candidate.bounds);

      if (collision.intersects(context.candidate.bounds, expandedBounds)) {
        return false;
      }
    }

    return true;
  }

  private createExpandedBounds(bounds: IBox2): Aabb2 {
    const aabb = this.requireAabb2(bounds);
    const min = aabb.min();
    const max = aabb.max();

    return this.boxModule.createAabb2(
      new Vector2Gpu(min.x - this.spacing, min.y - this.spacing),
      new Vector2Gpu(max.x + this.spacing, max.y + this.spacing)
    );
  }

  private requireAabb2(bounds: IBox2): Aabb2 {
    if (bounds instanceof Aabb2) {
      return bounds;
    }

    throw new Error("Placement playground spacing expects Aabb2 bounds.");
  }
}
