import type { IThreeScene } from "../IThreeScene.js";
import { PlaygroundSceneBase } from "../common/PlaygroundSceneBase.js";
import type { IMaterialFactory } from "../../../../core-threejs-app-framework/src/Materials/IMaterialFactory.js";
export declare class FooBuilderPlaygroundScene extends PlaygroundSceneBase {
    constructor(scene: IThreeScene, materialFactory: IMaterialFactory);
    protected createContent(): void;
    private randomInt;
    private randomFloat;
}
//# sourceMappingURL=FooBuilder.Playground.Scene.d.ts.map