// ====================================================================================
// FILE: src/three/core/ThreeApplication.ts
// ====================================================================================

//import { TreeTrunkPlaygroundScene } from "../../index.js";

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

    this.menu.register(
      "Placement.Playground.Scene",
      () => new PlacementScene(scene, materialFactory));

      // this.menu.register(
      // "TreeTrunkPlaygroundScene",
      // () => new TreeTrunkPlaygroundScene(scene, materialFactory));

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
