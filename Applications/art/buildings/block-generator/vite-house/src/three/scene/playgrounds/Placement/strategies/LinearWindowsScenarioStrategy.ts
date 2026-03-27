import type { IBoxModule } from "@monorepo/core-math-rectangle";
import { type IWallPlacementScenario, WALL_WIDTH, type IRegionalPlacementCandidate } from "../Placement.Platground.Scene.js";
import { WallPlacementScenarioStrategyBase } from "./WallPlacementScenarioStrategyBase.js";

export class LinearWindowsScenarioStrategy extends WallPlacementScenarioStrategyBase {
  public constructor(boxModule: IBoxModule) {
    super(boxModule);
  }

  public override createScenario(): IWallPlacementScenario {
    const regionId = "linear-band";
    const insetX = 0.5;
    const spacing = 0.4;
    const windowWidth = 0.7;
    const windowHeight = 2.2;
    const count = 8;
    const startX = (-WALL_WIDTH * 0.5) +
      insetX +
      (windowWidth * 0.5);

    const candidates: IRegionalPlacementCandidate[] = [];

    for (let index = 0; index < count; index++) {
      candidates.push(
        this.createCandidate(
          regionId,
          windowWidth,
          windowHeight,
          startX + index * (windowWidth + spacing),
          2
        )
      );
    }

    return {
      regions: [
        this.createRegion(regionId, -3.2, 0.5, 3.2, 3.5),
      ],
      candidates,
    };
  }
}
