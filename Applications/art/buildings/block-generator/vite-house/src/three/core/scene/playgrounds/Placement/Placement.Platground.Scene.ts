// ====================================================================================
// FILE: Placement.Playground.Scene.ts
// Demonstrates windows validated against explicit placement regions.
// ====================================================================================

import * as THREE from "three";
import { Vector2Gpu } from "@monorepo/core-math-gpu";
import { Aabb2, type IBox2 } from "@monorepo/core-math-rectangle";
import {
  type IPlacementCandidate,
  type IPlacementZone,
  type IRectangleKind,
} from "@monorepo/core-rectangle-placement";

import type { IThreeScene } from "../../IThreeScene.js";
import { PlaygroundSceneBase } from "../../common/PlaygroundSceneBase.js";
import type { IMaterialFactory } from "../../../../Materials/IMaterialFactory.js";
import { PlacementPlaygroundInitializationStrategy } from "./strategies/PlacementPlaygroundInitializationStrategy.js";
import { PlacementPlaygroundDrawingStrategy } from "./strategies/PlacementPlaygroundDrawingStrategy.js";
 
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

export class PlacementBoundsFactory {
  public createFromCenter(
    centerX: number,
    centerY: number,
    width: number,
    height: number,
  ): Aabb2 {
    return this.createFromEdges(
      centerX - (width * 0.5),
      centerY - (height * 0.5),
      centerX + (width * 0.5),
      centerY + (height * 0.5),
    );
  }

  public createFromEdges(
    minX: number,
    minY: number,
    maxX: number,
    maxY: number,
  ): Aabb2 {
    return new Aabb2(
      new Vector2Gpu(minX, minY),
      new Vector2Gpu(maxX, maxY),
    );
  }
}

export class Box2SpatialRules {
  public isContained(candidate: IBox2, container: IBox2): boolean {
    return candidate.getVertices().every((vertex) => container.contains(vertex));
  }

  public hasRequiredSpacingBetween(
    left: IBox2,
    right: IBox2,
    spacing: number,
  ): boolean {
    const leftBounds = this.getExtents(left);
    const rightBounds = this.getExtents(right);

    return (
      leftBounds.maxX + spacing <= rightBounds.minX ||
      rightBounds.maxX + spacing <= leftBounds.minX ||
      leftBounds.maxY + spacing <= rightBounds.minY ||
      rightBounds.maxY + spacing <= leftBounds.minY
    );
  }

  private getExtents(bounds: IBox2): {
    readonly minX: number;
    readonly minY: number;
    readonly maxX: number;
    readonly maxY: number;
  } {
    const vertices = bounds.getVertices();
    const xValues = vertices.map((vertex) => vertex.x);
    const yValues = vertices.map((vertex) => vertex.y);

    return {
      minX: Math.min(...xValues),
      minY: Math.min(...yValues),
      maxX: Math.max(...xValues),
      maxY: Math.max(...yValues),
    };
  }
}

export class PlacementScene extends PlaygroundSceneBase {
  public constructor(
    scene: IThreeScene,
    materialFactory: IMaterialFactory,
  ) {
    super(scene, "placement-playground-root", materialFactory);
  }

  protected createContent(): void {
    const boundsFactory = new PlacementBoundsFactory();
    const spatialRules = new Box2SpatialRules();
    const initializationStrategy = new PlacementPlaygroundInitializationStrategy(boundsFactory);
    const drawingStrategy = new PlacementPlaygroundDrawingStrategy(
      this.materialFactory,
      spatialRules,
    );

    for (const initialization of initializationStrategy.initialize()) {
      this.addToRoot(drawingStrategy.draw(initialization));
    }
  }
}
