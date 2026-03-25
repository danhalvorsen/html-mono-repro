// ====================================================================================
// FILE: src/three/core/scene/playgrounds/Placement.Scene.ts
// ====================================================================================

import * as THREE from "three";
import type { IThreeScene } from "../IThreeScene.js";
import { PlaygroundSceneBase } from "../common/PlaygroundSceneBase.js";
import { MaterialToken } from "../../../Materials/MaterialToken.js";
import type { IMaterialFactory } from "../../../Materials/IMaterialFactory.js";
import { WindowBuilder } from "../../../Builders/IWindowBuilder.js";

import type {
  IPlacementCandidate,
  IOccupiedPlacement,
  IPlacementPlanner,
  IPlacementQuery,
 
  IRectangleKind,
} from "@monorepo/core-rectangle-placement";
import type { IBox2 } from "@monorepo/core-math-rectangle";
import { Vector2Gpu } from "@monorepo/core-math-gpu";

// ----------------------------------------------------------------------------
// Scene-local adapter contracts
// ----------------------------------------------------------------------------

export interface IObject3DToRectangleConverter {
  convert(source: THREE.Object3D): IBox2;
}

export interface IPlacementRectangleToObject3DMapper {
  apply(target: THREE.Object3D, bounds: IBox2, z: number): void;
}

export interface IPlacementCandidateFactory {
  create(kind: IRectangleKind, bounds: IBox2): IPlacementCandidate;
}

export interface IPlacementKindCatalog {
  readonly window: IRectangleKind;
}

export interface IPlacementSceneDependencies {
  readonly object3DToRectangleConverter: IObject3DToRectangleConverter;
  readonly placementRectangleToObject3DMapper: IPlacementRectangleToObject3DMapper;
  readonly placementPlanner: IPlacementPlanner;
  readonly placementCandidateFactory: IPlacementCandidateFactory;
  readonly placementKinds: IPlacementKindCatalog;
}

// ----------------------------------------------------------------------------
// Scene
// ----------------------------------------------------------------------------

export class PlacementScene extends PlaygroundSceneBase {
  private readonly dependencies: IPlacementSceneDependencies;

  public constructor(
    scene: IThreeScene,
    materialFactory: IMaterialFactory,
    dependencies: IPlacementSceneDependencies,
  ) {
    super(scene, "placement-playground-root", materialFactory);

    this.dependencies = dependencies;
  }

  protected createContent(): void {
    const wall = this.createWall();
    const hostBounds = this.dependencies.object3DToRectangleConverter.convert(wall);

    const placedObjects: THREE.Object3D[] = [];
    const occupied: IOccupiedPlacement[] = [];

    const desiredWindowBounds = this.createDesiredWindowBounds(hostBounds);

    for (const desiredBounds of desiredWindowBounds) {
      const query: IPlacementQuery = {
        kind: this.dependencies.placementKinds.window,
        minimumBounds: desiredBounds,
      };

      const candidate = this.dependencies.placementCandidateFactory.create(
        this.dependencies.placementKinds.window,
        desiredBounds,
      );

      const result = this.dependencies.placementPlanner.plan(query, candidate, occupied);

      if (!result.isValid || result.acceptedPlan === null) {
        continue;
      }

      const windowObject = this.createWindowObject();
      const placedBounds = result.acceptedPlan.reservation.placeholder.bounds;

      this.dependencies.placementRectangleToObject3DMapper.apply(windowObject, placedBounds, 0.16);

      placedObjects.push(windowObject);
      occupied.push({
        candidate: this.dependencies.placementCandidateFactory.create(
          this.dependencies.placementKinds.window,
          placedBounds,
        ),
      });
    }

    this.addToRoot(...placedObjects);
  }

  private createWall(): THREE.Mesh {
    const wall = new THREE.Mesh(
      new THREE.BoxGeometry(8, 4, 0.3),
      this.materialFactory.create(MaterialToken.BuildingWhite),
    );

    wall.name = "placement-scene-wall";
    wall.position.set(0, 2, 0);
    wall.castShadow = true;
    wall.receiveShadow = true;

    this.addToRoot(wall);

    return wall;
  }

  private createWindowObject(): THREE.Object3D {
    const builder = WindowBuilder.create(this.materialFactory);

    return builder
      .reset()
      .withFrame(
        { x: 0, y: 0, width: 0.7, height: 2.2 },
        MaterialToken.BuildingBlue,
      )
      .withGlass(MaterialToken.WindowGlassDark, 0.08)
      .build();
  }

  private createDesiredWindowBounds(hostBounds: IBox2): readonly IBox2[] {
    const width = 0.7;
    const height = 2.2;

    const hostCenter = hostBounds.center();
    const hostWidth = hostBounds.width();
    const halfWidth = width * 0.5;
    const halfHeight = height * 0.5;

    return [
      this.createAxisAlignedBox2(
        hostCenter.x - (hostWidth * 0.25),
        hostCenter.y,
        halfWidth,
        halfHeight,
      ),
      this.createAxisAlignedBox2(
        hostCenter.x,
        hostCenter.y,
        halfWidth,
        halfHeight,
      ),
      this.createAxisAlignedBox2(
        hostCenter.x + (hostWidth * 0.25),
        hostCenter.y,
        halfWidth,
        halfHeight,
      ),
    ];
  }

  private createAxisAlignedBox2(
    centerX: number,
    centerY: number,
    halfWidth: number,
    halfHeight: number,
  ): IBox2 {
    const minX = centerX - halfWidth;
    const maxX = centerX + halfWidth;
    const minY = centerY - halfHeight;
    const maxY = centerY + halfHeight;

    return new AxisAlignedSceneBox2(minX, minY, maxX, maxY);
  }
}

// ----------------------------------------------------------------------------
// Scene-local deterministic Box2 implementation for desired candidate bounds
// ----------------------------------------------------------------------------

// add this import beside the IBox2 import

// ----------------------------------------------------------------------------
// Scene-local deterministic Box2 implementation for desired candidate bounds
// ----------------------------------------------------------------------------

class AxisAlignedSceneBox2 implements IBox2 {
  private readonly minXValue: number;
  private readonly minYValue: number;
  private readonly maxXValue: number;
  private readonly maxYValue: number;

  public constructor(
    minX: number,
    minY: number,
    maxX: number,
    maxY: number,
  ) {
    if (maxX <= minX) {
      throw new Error("maxX must be greater than minX.");
    }

    if (maxY <= minY) {
      throw new Error("maxY must be greater than minY.");
    }

    this.minXValue = minX;
    this.minYValue = minY;
    this.maxXValue = maxX;
    this.maxYValue = maxY;
  }

  public getVertices(): readonly Vector2Gpu[] {
    return [
      new Vector2Gpu(this.minXValue, this.minYValue),
      new Vector2Gpu(this.maxXValue, this.minYValue),
      new Vector2Gpu(this.maxXValue, this.maxYValue),
      new Vector2Gpu(this.minXValue, this.maxYValue),
    ];
  }

  public getEdges(): readonly (readonly [Vector2Gpu, Vector2Gpu])[] {
    const [v0, v1, v2, v3] = this.getVertices();

    return [
      [v0, v1] as const,
      [v1, v2] as const,
      [v2, v3] as const,
      [v3, v0] as const,
    ];
  }

  public getAxes(): readonly Vector2Gpu[] {
    return [
      new Vector2Gpu(1, 0),
      new Vector2Gpu(0, 1),
    ];
  }

  public width(): number {
    return this.maxXValue - this.minXValue;
  }

  public height(): number {
    return this.maxYValue - this.minYValue;
  }

  public area(): number {
    return this.width() * this.height();
  }

  public perimeter(): number {
    return (this.width() * 2) + (this.height() * 2);
  }

  public center(): Vector2Gpu {
    return new Vector2Gpu(
      this.minXValue + (this.width() * 0.5),
      this.minYValue + (this.height() * 0.5),
    );
  }

  public contains(point: Vector2Gpu): boolean {
    return (
      point.x >= this.minXValue &&
      point.x <= this.maxXValue &&
      point.y >= this.minYValue &&
      point.y <= this.maxYValue
    );
  }
}
 
