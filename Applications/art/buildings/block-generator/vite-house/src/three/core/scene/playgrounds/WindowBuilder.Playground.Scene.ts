// ====================================================================================
// FILE: src/three/core/scene/playgrounds/WindowBuilder.Playground.Scene.ts
// ====================================================================================

import * as THREE from "three";
import type { IThreeScene } from "../../IThreeScene.js";
import { PlaygroundSceneBase } from "../common/PlaygroundSceneBase.js";
 
import type { IMaterialFactory } from "../../../../composition/Materials/IMaterialFactory.js";
import { MaterialToken } from "../../../../composition/Materials/MaterialToken.js";
import { WindowBuilder } from "../../../../composition/IWindowBuilder";

export class WindowBuilderPlaygroundScene extends PlaygroundSceneBase {
  public constructor(
    scene: IThreeScene,
    materialFactory: IMaterialFactory,
  ) {
    super(scene, "window-builder-playground-root", materialFactory);
    this.initialize();
  }

  protected createContent(): void {
    this.createWall();
    this.createFrontWindows();
  }

  private createWall(): void {
    const wall = new THREE.Mesh(
      new THREE.BoxGeometry(8, 4, 0.3),
      this.materialFactory.create(MaterialToken.BuildingWhite),
    );

    wall.position.set(0, 2, 0);
    wall.castShadow = true;
    wall.receiveShadow = true;

    this.addToRoot(wall);
  }

  private createFrontWindows(): void {
    const builder = WindowBuilder.create(this.materialFactory);

    const createWindow = (): THREE.Object3D =>
      builder
        .reset()
        .withFrame(
          { x: 0, y: 0, width: 0.7, height: 2.2, depth: 0.08 },
          MaterialToken.WindowFrame,
        )
        .withGlass(MaterialToken.WindowGlassDark, 0.08)
        .build();

    const window1 = createWindow();
    const window2 = createWindow();
    const window3 = createWindow();

    window1.position.set(-2, 2, 0.16);
    window2.position.set(0, 2, 0.16);
    window3.position.set(2, 2, 0.16);

    this.addToRoot(window1, window2, window3);
  }
}