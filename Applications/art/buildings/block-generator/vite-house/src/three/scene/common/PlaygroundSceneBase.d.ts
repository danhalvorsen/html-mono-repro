import type { IThreeScene } from "../IThreeScene.js";
import { SceneObjectBase } from "./SceneObjectBase.js";
import type { IMaterialFactory } from "../../../../core-threejs-app-framework/src/Materials/IMaterialFactory.js";
export declare abstract class PlaygroundSceneBase extends SceneObjectBase {
    protected readonly materialFactory: IMaterialFactory;
    protected constructor(scene: IThreeScene, rootName: string, materialFactory: IMaterialFactory);
    protected initialize(): void;
    protected createDefaultLights(): void;
    protected createDefaultGround(width?: number, height?: number, depth?: number): void;
    protected createContent(): void;
}
//# sourceMappingURL=PlaygroundSceneBase.d.ts.map