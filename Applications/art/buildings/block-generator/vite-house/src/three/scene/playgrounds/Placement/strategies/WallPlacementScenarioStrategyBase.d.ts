import type { IBoxModule } from "@monorepo/core-math-rectangle";
import type { IPlacementZone } from "@monorepo/core-rectangle-placement";
import { type IRegionalPlacementCandidate, type IWallPlacementScenario, type IWallPlacementScenarioStrategy } from "../Placement.Platground.Scene.js";
export declare abstract class WallPlacementScenarioStrategyBase implements IWallPlacementScenarioStrategy {
    private readonly boxModule;
    protected constructor(boxModule: IBoxModule);
    abstract createScenario(): IWallPlacementScenario;
    protected createRegion(id: string, minX: number, minY: number, maxX: number, maxY: number): IPlacementZone;
    protected createCandidate(regionId: string, width: number, height: number, centerX: number, centerY: number): IRegionalPlacementCandidate;
}
//# sourceMappingURL=WallPlacementScenarioStrategyBase.d.ts.map