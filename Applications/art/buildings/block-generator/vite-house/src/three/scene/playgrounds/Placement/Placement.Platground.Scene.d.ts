import * as THREE from "three";
import { type IBox2 } from "@monorepo/core-math-rectangle";
import { type IPlacementCandidate, type IPlacementZone, type IRectangleKind } from "@monorepo/core-rectangle-placement";
import type { IThreeScene } from "../../IThreeScene.js";
import { PlaygroundSceneBase } from "../../common/PlaygroundSceneBase.js";
import type { IMaterialFactory } from "../../../../../core-threejs-app-framework/src/Materials/IMaterialFactory.js";
export declare const WALL_WIDTH = 8;
export declare const WALL_HEIGHT = 4;
export declare const WALL_DEPTH = 0.3;
export declare const SIDE_WALL_INWARD_ROTATION_RADIANS: number;
export declare const WINDOW_Z_OFFSET = 0.16;
export declare const WINDOW_KIND: IRectangleKind;
export declare const REGION_GUIDE_COLOR = 3120708;
export declare const REJECTED_GUIDE_COLOR = 13183530;
export interface IRegionalPlacementCandidate {
    readonly regionId: string;
    readonly candidate: IPlacementCandidate;
}
export interface IWallPlacementScenario {
    readonly regions: readonly IPlacementZone[];
    readonly candidates: readonly IRegionalPlacementCandidate[];
}
export interface IWallPlacementInitialization {
    readonly positionX: number;
    readonly positionZ: number;
    readonly rotationYRadians: number;
    readonly hostBounds: IBox2;
    readonly scenario: IWallPlacementScenario;
}
export interface IWallConnectionPoint {
    readonly x: number;
    readonly z: number;
}
export interface IWallPlacementScenarioStrategy {
    createScenario(): IWallPlacementScenario;
}
export interface IPlacementSceneInitializationStrategy {
    initialize(): readonly IWallPlacementInitialization[];
}
export interface IPlacementSceneDrawingStrategy {
    draw(initialization: IWallPlacementInitialization): THREE.Object3D;
}
export declare class PlacementScene extends PlaygroundSceneBase {
    constructor(scene: IThreeScene, materialFactory: IMaterialFactory);
    protected createContent(): void;
}
//# sourceMappingURL=Placement.Platground.Scene.d.ts.map