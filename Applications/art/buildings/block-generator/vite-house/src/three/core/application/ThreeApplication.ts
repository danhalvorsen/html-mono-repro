// ====================================================================================
// FILE: src/three/core/ThreeApplication.ts
// ====================================================================================

import type { IThreeApplication } from "./IThreeApplication.js";
import type { IUpdatable } from "../IUpdatable.js";

import { RenderLoop } from "../renderer/RenderLoop.js";
import { ResizeController } from "../ResizeController.js";

import { ThreeCamera } from "../camera/ThreeCamera.js";
import { ThreeHost } from "../host/ThreeHost.js";
import { ThreeRenderer } from "../renderer/ThreeRenderer.js";

import { MaterialFactory } from "../../Materials/MaterialFactory.js";
import { BuildingPreviewScene } from "../scene/BuildingPreviewScene.js";
import { FooBuilderPlaygroundScene } from "../scene/playgrounds/FooBuilder.Playground.Scene.js";

import { WindowBuilderPlaygroundScene } from "../scene/playgrounds/WindowBuilder.Playground.Scene.js";
import { TinyPrimitiveCompositionScene } from "../scene/playgrounds/TinyPrimitiveCompositionScene";

import { SceneMenu } from "../scene/SceneMenu.js";
import { OrbitCameraController } from "../camera/OrbitCameraController.js";
import { SceneClock } from "../scene/SceneClock.js";
import { SceneRenderer } from "../scene/SceneRenderer.js";
import { ThreeScene } from "../scene/ThreeScene.js";

type DisposableUpdatable = IUpdatable & {
  dispose?: () => void;
};

export class ThreeApplication implements IThreeApplication {
  private readonly resizeController: ResizeController;
  private readonly renderLoop: RenderLoop;
  private readonly cameraController: OrbitCameraController;
  private readonly menu: SceneMenu;

  public constructor(container: HTMLElement) {
    const host = new ThreeHost(container);
    const scene = new ThreeScene();
    const camera = new ThreeCamera();
    const renderer = new ThreeRenderer(host);
    const materialFactory = new MaterialFactory();

    const sceneRenderer = new SceneRenderer(renderer, scene, camera);
    const clock = new SceneClock();

    this.renderLoop = new RenderLoop(sceneRenderer, clock);
    this.resizeController = new ResizeController(host, [camera, renderer]);
    this.cameraController = new OrbitCameraController(
      camera,
      renderer.getRenderer().domElement,
    );

    this.menu = new SceneMenu();

    this.menu.register(
      "BuildingPreviewScene",
      () => new BuildingPreviewScene(scene),
    );

    this.menu.register(
      "WindowBuilderPlaygroundScene",
      () => new WindowBuilderPlaygroundScene(scene, materialFactory),
    );

    this.menu.register(
      "FooBuilderPlaygroundScene",
      () => new FooBuilderPlaygroundScene(scene, materialFactory),
    );

    this.menu.register(
      "TinyPrimitiveCompositionScene",
      () => new TinyPrimitiveCompositionScene(scene, materialFactory),
    );

    this.menu.mount(container);
    this.menu.activate(0);

    this.renderLoop.add(this.cameraController);
    this.renderLoop.add({
      update: (deltaSeconds: number, elapsedSeconds: number): void => {
        this.menu.getActive()?.update(deltaSeconds, elapsedSeconds);
      },
    });
  }

  public start(): void {
    this.resizeController.connect();
    this.cameraController.connect();
    this.renderLoop.start();
  }

  public stop(): void {
    const active = this.menu.getActive() as DisposableUpdatable | null;
    active?.dispose?.();

    this.renderLoop.stop();
    this.cameraController.disconnect();
    this.resizeController.disconnect();
  }
}
