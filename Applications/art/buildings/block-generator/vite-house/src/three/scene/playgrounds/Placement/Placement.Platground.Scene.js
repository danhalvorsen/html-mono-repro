// ====================================================================================
// FILE: Placement.Playground.Scene.ts
// Demonstrates windows validated against explicit placement regions.
// ====================================================================================
import { BoxCompositionRoot } from "@monorepo/core-math-rectangle";
import { PlaygroundSceneBase } from "../../common/PlaygroundSceneBase.js";
import { PlacementPlaygroundInitializationStrategy } from "./strategies/PlacementPlaygroundInitializationStrategy.js";
import { PlacementPlaygroundDrawingStrategy } from "./strategies/PlacementPlaygroundDrawingStrategy.js";
export const WALL_WIDTH = 8;
export const WALL_HEIGHT = 4;
export const WALL_DEPTH = 0.3;
export const SIDE_WALL_INWARD_ROTATION_RADIANS = Math.PI / 4;
export const WINDOW_Z_OFFSET = 0.16;
export const WINDOW_KIND = { value: "window" };
export const REGION_GUIDE_COLOR = 0x2f9e44;
export const REJECTED_GUIDE_COLOR = 0xc92a2a;
export class PlacementScene extends PlaygroundSceneBase {
    constructor(scene, materialFactory) {
        super(scene, "placement-playground-root", materialFactory);
    }
    createContent() {
        const boxModule = new BoxCompositionRoot();
        const initializationStrategy = new PlacementPlaygroundInitializationStrategy(boxModule);
        const drawingStrategy = new PlacementPlaygroundDrawingStrategy(this.materialFactory, boxModule);
        for (const initialization of initializationStrategy.initialize()) {
            this.addToRoot(drawingStrategy.draw(initialization));
        }
    }
}
//# sourceMappingURL=Placement.Platground.Scene.js.map