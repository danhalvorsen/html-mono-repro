import { Vector2Gpu } from "@monorepo/core-math-gpu";
import { WINDOW_KIND } from "../Placement.Platground.Scene.js";
export class WallPlacementScenarioStrategyBase {
    boxModule;
    constructor(boxModule) {
        this.boxModule = boxModule;
    }
    createRegion(id, minX, minY, maxX, maxY) {
        return {
            id: { value: id },
            bounds: this.boxModule.createAabb2(new Vector2Gpu(minX, minY), new Vector2Gpu(maxX, maxY)),
            allowedKinds: [WINDOW_KIND],
        };
    }
    createCandidate(regionId, width, height, centerX, centerY) {
        return {
            regionId,
            candidate: {
                kind: WINDOW_KIND,
                bounds: this.boxModule.createAabb2(new Vector2Gpu(centerX - (width * 0.5), centerY - (height * 0.5)), new Vector2Gpu(centerX + (width * 0.5), centerY + (height * 0.5))),
            },
        };
    }
}
//# sourceMappingURL=WallPlacementScenarioStrategyBase.js.map