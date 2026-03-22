import type { IThreeCamera } from "../camera/IThreeCamera";
import type { IFrameRenderer } from "../renderer/IFrameRenderer";
import type { IThreeRenderer } from "../renderer/IThreeRenderer";
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
