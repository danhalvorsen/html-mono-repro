import type { IPlacementZone } from "@monorepo/core-rectangle-placement";
import { WINDOW_KIND, type IRegionalPlacementCandidate, type IWallPlacementScenario, type IWallPlacementScenarioStrategy, type PlacementBoundsFactory } from "../Placement.Platground.Scene";

export abstract class WallPlacementScenarioStrategyBase
  implements IWallPlacementScenarioStrategy {
  protected constructor(
    private readonly boundsFactory: PlacementBoundsFactory
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
      bounds: this.boundsFactory.createFromEdges(minX, minY, maxX, maxY),
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
        bounds: this.boundsFactory.createFromCenter(centerX, centerY, width, height),
      },
    };
  }
}
