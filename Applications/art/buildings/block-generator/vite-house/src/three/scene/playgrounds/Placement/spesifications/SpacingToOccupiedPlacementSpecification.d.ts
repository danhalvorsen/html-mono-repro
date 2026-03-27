import { type IBoxModule } from "@monorepo/core-math-rectangle";
import type { IPlacementContext } from "@monorepo/core-rectangle-placement";
export declare class SpacingToOccupiedPlacementSpecification {
    private readonly boxModule;
    private readonly spacing;
    constructor(boxModule: IBoxModule, spacing: number);
    isSatisfiedBy(context: IPlacementContext): boolean;
    private createExpandedBounds;
    private requireAabb2;
}
//# sourceMappingURL=SpacingToOccupiedPlacementSpecification.d.ts.map