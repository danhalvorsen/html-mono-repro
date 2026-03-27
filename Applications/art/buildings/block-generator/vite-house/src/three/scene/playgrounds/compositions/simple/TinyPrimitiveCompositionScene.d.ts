import type { IMaterialFactory } from "../../../../../../core-threejs-app-framework/src/Materials/IMaterialFactory.js";
import { PlaygroundSceneBase } from "../../../common/PlaygroundSceneBase.js";
import type { IThreeScene } from "../../../IThreeScene.js";
export declare class TinyPrimitiveCompositionScene extends PlaygroundSceneBase {
    private _primitiveNodeFactory?;
    constructor(scene: IThreeScene, materialFactory: IMaterialFactory);
    private get primitiveNodeFactory();
    protected createContent(): void;
    private createSceneGraph;
    private createHouseTemplate;
    private applyMaterial;
}
//# sourceMappingURL=TinyPrimitiveCompositionScene.d.ts.map