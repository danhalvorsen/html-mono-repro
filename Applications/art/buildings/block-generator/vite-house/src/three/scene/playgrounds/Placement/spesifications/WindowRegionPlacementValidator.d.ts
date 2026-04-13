import { type IBox2, type IBoxModule } from "@monorepo/core-math-rectangle";
import { type IOccupiedPlacement, type IPlacementResult, type IPlacementZone } from "@monorepo/core-rectangle-placement";
import type { IRegionalPlacementCandidate } from "../Placement.Platground.Scene.js";
export declare class WindowRegionPlacementValidator {
    private readonly hostBounds;
    private readonly regionsById;
    private readonly insideHostSpecification;
    private readonly spacingSpecification;
    constructor(hostBounds: IBox2, regions: readonly IPlacementZone[], minimumSpacing: number, boxModule: IBoxModule);
    validate(regionalCandidate: IRegionalPlacementCandidate, occupied: readonly IOccupiedPlacement[]): IPlacementResult;
    private createRejectedResult;
    private createAcceptedPlaceholder;
}
//# sourceMappingURL=WindowRegionPlacementValidator.d.ts.map