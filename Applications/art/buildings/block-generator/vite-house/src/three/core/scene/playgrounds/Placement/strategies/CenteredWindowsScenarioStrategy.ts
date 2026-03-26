import type { PlacementBoundsFactory, IWallPlacementScenario } from "../Placement.Platground.Scene";
import { WallPlacementScenarioStrategyBase } from "./WallPlacementScenarioStrategyBase";

export class CenteredWindowsScenarioStrategy extends WallPlacementScenarioStrategyBase {
  public constructor(boundsFactory: PlacementBoundsFactory) {
    super(boundsFactory);
  }

  public override createScenario(): IWallPlacementScenario {
    const regions = [
      this.createRegion("left-bay", -3.0, 0.5, -1.0, 3.5),
      this.createRegion("center-bay", -1.0, 0.5, 1.0, 3.5),
      this.createRegion("right-bay", 1.0, 0.5, 3.0, 3.5),
    ];

    return {
      regions,
      candidates: [
        this.createCandidate("left-bay", 0.8, 2.2, -2, 2),
        this.createCandidate("center-bay", 0.8, 2.2, 0, 2),
        this.createCandidate("right-bay", 0.8, 2.2, 2, 2),
      ],
    };
  }
}
