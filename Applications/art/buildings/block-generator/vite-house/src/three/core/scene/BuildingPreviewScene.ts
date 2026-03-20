// ====================================================================================
// FILE: src/three/core/scene/BuildingPreviewScene.ts
// ====================================================================================

import * as THREE from "three";
import { MaterialFactory } from "../../Materials/MaterialFactory.js";
import { MaterialToken } from "../../Materials/MaterialToken.js";
import { SmallSkyScraperBuilder } from "../../Builders/SmallSkyScraperBuilder.js";
import type { IThreeScene } from "../IThreeScene.js";
import { SceneObjectBase } from "./common/SceneObjectBase.js";

export class BuildingPreviewScene extends SceneObjectBase {
  private readonly materialFactory: MaterialFactory;

  public constructor(scene: IThreeScene) {
    super(scene, "building-preview-root");
    this.materialFactory = new MaterialFactory();
    this.initialize();
  }

  protected initialize(): void {
    this.createLights();
    this.createGround();
    this.createBuildings();
  }

  protected override onUpdate(
    _deltaSeconds: number,
    elapsedSeconds: number,
  ): void {
    this.root.rotation.y = elapsedSeconds * 0.15;
  }

  private createLights(): void {
    const ambient = new THREE.AmbientLight(0xffffff, 1.5);

    const sun = new THREE.DirectionalLight(0xffffff, 2.2);
    sun.position.set(18, 28, 12);
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    sun.shadow.camera.left = -40;
    sun.shadow.camera.right = 40;
    sun.shadow.camera.top = 40;
    sun.shadow.camera.bottom = -40;
    sun.shadow.camera.near = 1;
    sun.shadow.camera.far = 120;

    this.addToScene(ambient, sun);
  }

  private createGround(): void {
    const mesh = new THREE.Mesh(
      new THREE.BoxGeometry(80, 1, 80),
      this.materialFactory.create(MaterialToken.Grass),
    );

    mesh.receiveShadow = true;
    mesh.position.set(0, -0.5, 0);

    this.addToScene(mesh);
  }

  private createBuildings(): void {
    const buildingA = SmallSkyScraperBuilder.create(this.materialFactory)
      .withLevels(5)
      .withWidth(4)
      .withDepth(3)
      .withLevelHeight(1.85)
      .withPosition(0, 0, 0)
      .build();

    const buildingB = SmallSkyScraperBuilder.create(this.materialFactory)
      .withLevels(6)
      .withWidth(4.2)
      .withDepth(3.1)
      .withLevelHeight(1.75)
      .withPosition(8, 0, -3)
      .build();

    const buildingC = SmallSkyScraperBuilder.create(this.materialFactory)
      .withLevels(4)
      .withWidth(3.6)
      .withDepth(2.8)
      .withLevelHeight(1.8)
      .withPosition(-7, 0, 4)
      .build();

    this.addToRoot(buildingA, buildingB, buildingC);
  }
}