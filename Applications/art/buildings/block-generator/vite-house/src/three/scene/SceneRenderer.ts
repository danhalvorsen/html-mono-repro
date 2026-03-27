import type { IThreeCamera } from "../../../core-threejs-app-framework/src/camera/IThreeCamera.js";
import type { IFrameRenderer } from "../../../core-threejs-app-framework/src/renderer/IFrameRenderer.js";
import type { IThreeRenderer } from "../../../core-threejs-app-framework/src/renderer/IThreeRenderer.js";
import type { IThreeScene } from "./IThreeScene.js";

export class SceneRenderer implements IFrameRenderer {
    public constructor(
        private readonly renderer: IThreeRenderer,
        private readonly scene: IThreeScene,
        private readonly camera: IThreeCamera
    ) { }

    public renderFrame(): void {
        this.renderer.render(this.scene.getScene(), this.camera.getCamera());
    }
}
