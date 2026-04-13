import type { IThreeScene } from "../IThreeScene.js";
import { PlaygroundSceneBase } from "../common/PlaygroundSceneBase.js";
import type { IMaterialFactory } from "../../../../core-threejs-app-framework/src/Materials/IMaterialFactory.js";
export declare class WindowBuilderPlaygroundScene extends PlaygroundSceneBase {
    constructor(scene: IThreeScene, materialFactory: IMaterialFactory);
    protected createContent(): void;
    private createWall;
    private createFrontWindows;
}
//# sourceMappingURL=WindowBuilder.Playground.Scene.d.ts.map