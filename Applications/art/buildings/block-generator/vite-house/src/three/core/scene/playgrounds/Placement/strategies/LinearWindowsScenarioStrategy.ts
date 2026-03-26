import { PlacementBoundsFactory, type IWallPlacementScenario, WALL_WIDTH, type IRegionalPlacementCandidate } from "../Placement.Platground.Scene";
import { WallPlacementScenarioStrategyBase } from "./WallPlacementScenarioStrategyBase";

export class LinearWindowsScenarioStrategy extends WallPlacementScenarioStrategyBase {
  public constructor(boundsFactory: PlacementBoundsFactory) {
    super(boundsFactory);
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
