import type { IBoxModule } from "@monorepo/core-math-rectangle";
import { type IPlacementSceneInitializationStrategy, type IWallPlacementInitialization } from "../Placement.Platground.Scene.js";
export declare class PlacementPlaygroundInitializationStrategy implements IPlacementSceneInitializationStrategy {
    private readonly boxModule;
    constructor(boxModule: IBoxModule);
    initialize(): readonly IWallPlacementInitialization[];
    private createSideWallInitialization;
    private createCenterWallInitialization;
    private createConnectionPoint;
}
//# sourceMappingURL=PlacementPlaygroundInitializationStrategy.d.ts.map