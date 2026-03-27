import type { IThreeScene } from "./IThreeScene.js";
import { SceneObjectBase } from "./common/SceneObjectBase.js";
export declare class BuildingPreviewScene extends SceneObjectBase {
    private readonly materialFactory;
    constructor(scene: IThreeScene);
    protected initialize(): void;
    protected onUpdate(_deltaSeconds: number, elapsedSeconds: number): void;
    private createLights;
    private createGround;
    private createBuildings;
}
//# sourceMappingURL=BuildingPreviewScene.d.ts.map