// ====================================================================================
// FILE: Placement.Playground.Scene.ts
// Demonstrates windows validated against explicit placement regions.
// ====================================================================================

import * as THREE from "three";
import { BoxCompositionRoot, type IBox2 } from "@monorepo/core-math-rectangle";
import {
  type IPlacementCandidate,
  type IPlacementZone,
  type IRectangleKind,
} from "@monorepo/core-rectangle-placement";

import type { IThreeScene } from "../../IThreeScene.ts";
import { PlaygroundSceneBase } from "../../common/PlaygroundSceneBase.ts";
import type { IMaterialFactory } from "@monorepo/core-threejs-app-framework/src/Materials/IMaterialFactory.js";
import { PlacementPlaygroundInitializationStrategy } from "./strategies/PlacementPlaygroundInitializationStrategy.ts";
import { PlacementPlaygroundDrawingStrategy } from "./strategies/PlacementPlaygroundDrawingStrategy.ts";
 
export const WALL_WIDTH = 8;
export const WALL_HEIGHT = 4;
export const WALL_DEPTH = 0.3;
export const SIDE_WALL_INWARD_ROTATION_RADIANS = Math.PI / 4;
export const WINDOW_Z_OFFSET = 0.16;
export const WINDOW_KIND: IRectangleKind = { value: "window" };
export const REGION_GUIDE_COLOR = 0x2f9e44;
export const REJECTED_GUIDE_COLOR = 0xc92a2a;

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

export class PlacementScene extends PlaygroundSceneBase {
  public constructor(
    scene: IThreeScene,
    materialFactory: IMaterialFactory,
    viewId = "placement",
  ) {
    super(scene, "placement-playground-root", materialFactory, viewId);
  }

  protected createContent(): void {
    const boxModule = new BoxCompositionRoot();
    const initializationStrategy = new PlacementPlaygroundInitializationStrategy(boxModule);
    const drawingStrategy = new PlacementPlaygroundDrawingStrategy(
      this.materialFactory,
      boxModule,
    );

    for (const initialization of initializationStrategy.initialize()) {
      this.addToRoot(drawingStrategy.draw(initialization));
    }
  }
}
