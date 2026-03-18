import type { IFrameRenderer } from "./IFrameRenderer";
import type { IThreeCamera } from "./IThreeCamera";
import type { IThreeRenderer } from "./IThreeRenderer";
import type { IThreeScene } from "./IThreeScene";

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
