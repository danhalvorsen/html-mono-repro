import { Vector2Gpu } from "@monorepo/core-math-gpu";
import { Aabb2 } from "@monorepo/core-math-rectangle";
export class SpacingToOccupiedPlacementSpecification {
    boxModule;
    spacing;
    constructor(boxModule, spacing) {
        this.boxModule = boxModule;
        this.spacing = spacing;
    }
    isSatisfiedBy(context) {
        const collision = this.boxModule.createBox2Collision();
        for (const occupied of context.occupied) {
            const expandedBounds = this.createExpandedBounds(occupied.candidate.bounds);
            if (collision.intersects(context.candidate.bounds, expandedBounds)) {
                return false;
            }
        }
        return true;
    }
    createExpandedBounds(bounds) {
        const aabb = this.requireAabb2(bounds);
        const min = aabb.min();
        const max = aabb.max();
        return this.boxModule.createAabb2(new Vector2Gpu(min.x - this.spacing, min.y - this.spacing), new Vector2Gpu(max.x + this.spacing, max.y + this.spacing));
    }
    requireAabb2(bounds) {
        if (bounds instanceof Aabb2) {
            return bounds;
        }
        throw new Error("Placement playground spacing expects Aabb2 bounds.");
    }
}
//# sourceMappingURL=SpacingToOccupiedPlacementSpecification.js.map