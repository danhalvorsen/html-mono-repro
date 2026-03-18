
import { BuildingPreviewScene } from "./scene/BuildingPreviewScene";
import type { IThreeApplication } from "./IThreeApplication";
import { RenderLoop } from "./RenderLoop";
import { ResizeController } from "./ResizeController";
import { SceneClock } from "./SceneClock";
import { SceneRenderer } from "./SceneRenderer";
import { ThreeCamera } from "./ThreeCamera";
import { ThreeHost } from "./ThreeHost";
import { ThreeRenderer } from "./ThreeRenderer";
import { ThreeScene } from "./ThreeScene";

export class ThreeApplication implements IThreeApplication {
    private readonly resizeController: ResizeController;
    private readonly renderLoop: RenderLoop;

    public constructor(container: HTMLElement) {
        const host = new ThreeHost(container);
        const scene = new ThreeScene();
        const camera = new ThreeCamera();
        const renderer = new ThreeRenderer(host);

        const sceneRenderer = new SceneRenderer(renderer, scene, camera);
        const clock = new SceneClock();

        this.renderLoop = new RenderLoop(sceneRenderer, clock);
        this.resizeController = new ResizeController(host, [camera, renderer]);

        const buildingPreviewScene = new BuildingPreviewScene(scene);
        this.renderLoop.add(buildingPreviewScene);
    }

    public start(): void {
        this.resizeController.connect();
        this.renderLoop.start();
    }

    public stop(): void {
        this.renderLoop.stop();
        this.resizeController.disconnect();
    }
}
