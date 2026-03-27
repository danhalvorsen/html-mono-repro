import { Vector2Gpu } from "@monorepo/core-math-gpu";
import type { IBoxModule } from "@monorepo/core-math-rectangle";
import type { IPlacementZone } from "@monorepo/core-rectangle-placement";
import { WINDOW_KIND, type IRegionalPlacementCandidate, type IWallPlacementScenario, type IWallPlacementScenarioStrategy } from "../Placement.Platground.Scene.js";

export abstract class WallPlacementScenarioStrategyBase
  implements IWallPlacementScenarioStrategy {
  protected constructor(
    private readonly boxModule: IBoxModule,
  ) { }

  public abstract createScenario(): IWallPlacementScenario;

  protected createRegion(
    id: string,
    minX: number,
    minY: number,
    maxX: number,
    maxY: number
  ): IPlacementZone {
    return {
      id: { value: id },
      bounds: this.boxModule.createAabb2(
        new Vector2Gpu(minX, minY),
        new Vector2Gpu(maxX, maxY),
      ),
      allowedKinds: [WINDOW_KIND],
    };
  }

  protected createCandidate(
    regionId: string,
    width: number,
    height: number,
    centerX: number,
    centerY: number
  ): IRegionalPlacementCandidate {
    return {
      regionId,
      candidate: {
        kind: WINDOW_KIND,
        bounds: this.boxModule.createAabb2(
          new Vector2Gpu(centerX - (width * 0.5), centerY - (height * 0.5)),
          new Vector2Gpu(centerX + (width * 0.5), centerY + (height * 0.5)),
        ),
      },
    };
  }
}
