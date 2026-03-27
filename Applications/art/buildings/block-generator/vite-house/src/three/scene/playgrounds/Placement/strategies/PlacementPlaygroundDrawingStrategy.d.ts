import type { IBoxModule } from "@monorepo/core-math-rectangle";
import type { IMaterialFactory } from "../../../../../../core-threejs-app-framework/src/Materials/IMaterialFactory.js";
import { type IPlacementSceneDrawingStrategy, type IWallPlacementInitialization } from "../Placement.Platground.Scene.js";
import * as THREE from "three";
export declare class PlacementPlaygroundDrawingStrategy implements IPlacementSceneDrawingStrategy {
    private readonly materialFactory;
    private readonly boxModule;
    constructor(materialFactory: IMaterialFactory, boxModule: IBoxModule);
    draw(initialization: IWallPlacementInitialization): THREE.Object3D;
    private drawValidatedWindows;
    private createWallMesh;
    private createWindow;
    private createBoundsGuide;
}
//# sourceMappingURL=PlacementPlaygroundDrawingStrategy.d.ts.map