import type { IBoxModule } from "@monorepo/core-math-rectangle";
import type { IWallPlacementScenario } from "../Placement.Platground.Scene.js";
import { WallPlacementScenarioStrategyBase } from "./WallPlacementScenarioStrategyBase.js";
export declare class GridWindowsScenarioStrategy extends WallPlacementScenarioStrategyBase {
    constructor(boxModule: IBoxModule);
    createScenario(): IWallPlacementScenario;
}
//# sourceMappingURL=GridWindowsScenarioStrategy.d.ts.map