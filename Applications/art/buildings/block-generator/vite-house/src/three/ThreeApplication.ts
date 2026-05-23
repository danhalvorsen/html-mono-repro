// ====================================================================================
// FILE: src/three/core/ThreeApplication.ts
// ====================================================================================

import { MaterialFactory } from "@monorepo/core-threejs-app-framework/src/Materials/MaterialFactory.js";
import { OrbitCameraController } from "@monorepo/core-threejs-app-framework/src/camera/OrbitCameraController.js";
import { ThreeCamera } from "@monorepo/core-threejs-app-framework/src/camera/ThreeCamera.js";
import { ThreeHost } from "@monorepo/core-threejs-app-framework/src/host/ThreeHost.js";
import { RenderLoop } from "@monorepo/core-threejs-app-framework/src/renderer/RenderLoop.js";
import { ThreeRenderer } from "@monorepo/core-threejs-app-framework/src/renderer/ThreeRenderer.js";
import { ResizeController } from "@monorepo/core-threejs-app-framework/src/ResizeController.js";
import { SceneClock } from "./scene/SceneClock";
import { SceneMenu } from "./scene/SceneMenu";
import { playgroundPlugins } from "./scene/playgrounds/playgroundPlugins.ts";
import { SceneRenderer } from "./scene/SceneRenderer";
import { ThreeScene } from "./scene/ThreeScene";

//import { TreeTrunkPlaygroundScene } from "../../index.js";
interface IThreeApplication {
  start(): void;
  stop(): void;
}

interface IUpdatable {
  update(deltaSeconds: number, elapsedSeconds: number): void;
}

type DisposableUpdatable = IUpdatable & {
  dispose?: () => void;
};

const ACTIVE_VIEW_QUERY_KEY = "view";
const ACTIVE_VIEW_STORAGE_KEY = "vite-house.activeViewId";

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

    for (const plugin of playgroundPlugins) {
      this.menu.register(plugin.label, plugin.id, () =>
        plugin.create({ scene, materialFactory }),
      );
    }

    this.menu.mount(container);
    this.menu.setOnViewChanged((viewId: string) => {
      this.persistActiveView(viewId);
    });

    const initialViewId = this.resolveInitialViewId();
    if (initialViewId === null || !this.menu.activateByViewId(initialViewId)) {
      this.menu.activate(0);
    }

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

  private resolveInitialViewId(): string | null {
    const queryValue = new URLSearchParams(window.location.search).get(ACTIVE_VIEW_QUERY_KEY);
    if (queryValue !== null && queryValue.length > 0) {
      return queryValue;
    }

    const localValue = window.localStorage.getItem(ACTIVE_VIEW_STORAGE_KEY);
    if (localValue !== null && localValue.length > 0) {
      return localValue;
    }

    return null;
  }

  private persistActiveView(viewId: string): void {
    const url = new URL(window.location.href);
    url.searchParams.set(ACTIVE_VIEW_QUERY_KEY, viewId);
    window.history.replaceState(null, "", url);
    window.localStorage.setItem(ACTIVE_VIEW_STORAGE_KEY, viewId);
  }
}
