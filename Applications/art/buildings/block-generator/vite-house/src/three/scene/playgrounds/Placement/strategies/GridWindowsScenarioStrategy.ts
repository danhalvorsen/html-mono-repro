import type { IBoxModule } from "@monorepo/core-math-rectangle";
import type { IPlacementZone } from "@monorepo/core-rectangle-placement";
import type { IRegionalPlacementCandidate, IWallPlacementScenario } from "../Placement.Platground.Scene.js";
import { WallPlacementScenarioStrategyBase } from "./WallPlacementScenarioStrategyBase.js";

export class GridWindowsScenarioStrategy extends WallPlacementScenarioStrategyBase {
  public constructor(boxModule: IBoxModule) {
    super(boxModule);
  }

  public override createScenario(): IWallPlacementScenario {
    const regions: IPlacementZone[] = [];
    const candidates: IRegionalPlacementCandidate[] = [];
    const cols = 4;
    const rows = 2;
    const spacingX = 1.2;
    const spacingY = 1.5;
    const startX = -((cols - 1) * spacingX) * 0.5;
    const startY = 1.2;

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const centerX = startX + col * spacingX;
        const centerY = startY + row * spacingY;
        const regionId = `grid-${row}-${col}`;

        regions.push(
          this.createRegion(
            regionId,
            centerX - 0.55,
            centerY - 0.75,
            centerX + 0.55,
            centerY + 0.75
          )
        );

        candidates.push(
          this.createCandidate(regionId, 0.6, 1.2, centerX, centerY)
        );
      }
    }

    return { regions, candidates };
  }
}
