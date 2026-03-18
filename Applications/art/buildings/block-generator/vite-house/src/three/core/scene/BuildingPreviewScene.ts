// ====================================================================================
// FILE: three/scene/BuildingPreviewScene.ts
// ====================================================================================

import * as THREE from "three";
import type { IUpdatable } from "../IUpdatable.js";
import type { IThreeScene } from "../IThreeScene.js";
import { SmallSkyScraperBuilder } from "../../../composition/SmallSkyScraperBuilder.js";
import { MaterialFactory } from "../../../composition/Materials/MaterialFactory.js";
 
export class BuildingPreviewScene implements IUpdatable {
  private readonly root: THREE.Group;
  private readonly materialFactory: MaterialFactory;

  public constructor(private readonly scene: IThreeScene) {
    this.root = new THREE.Group();
    this.root.name = "building-preview-root";

    this.materialFactory = new MaterialFactory();

    this.createLights();
    this.createGround();
    this.createBuildings();

    this.scene.getScene().add(this.root);
  }

  public update(_deltaSeconds: number, elapsedSeconds: number): void {
    this.root.rotation.y = elapsedSeconds * 0.15;
  }

  private createLights(): void {
    const ambient = new THREE.AmbientLight(0xffffff, 1.5);
    this.scene.getScene().add(ambient);

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
    this.scene.getScene().add(sun);
  }

  private createGround(): void {
    const geometry = new THREE.BoxGeometry(80, 1, 80);
    const material = this.materialFactory.create("grass");

    const mesh = new THREE.Mesh(geometry, material);
    mesh.receiveShadow = true;
    mesh.position.set(0, -0.5, 0);

    this.scene.getScene().add(mesh);
  }

  private createBuildings(): void {
    const buildingA = SmallSkyScraperBuilder
      .create(this.materialFactory)
      .withLevels(5)
      .withWidth(4)
      .withDepth(3)
      .withLevelHeight(1.85)
      .withPosition(0, 0, 0)
      .build();

    const buildingB = SmallSkyScraperBuilder
      .create(this.materialFactory)
      .withLevels(6)
      .withWidth(4.2)
      .withDepth(3.1)
      .withLevelHeight(1.75)
      .withPosition(8, 0, -3)
      .build();

    const buildingC = SmallSkyScraperBuilder
      .create(this.materialFactory)
      .withLevels(4)
      .withWidth(3.6)
      .withDepth(2.8)
      .withLevelHeight(1.8)
      .withPosition(-7, 0, 4)
      .build();

    this.root.add(buildingA);
    this.root.add(buildingB);
    this.root.add(buildingC);
  }
}