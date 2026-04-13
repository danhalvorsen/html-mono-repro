import * as THREE from "three";
import type { IThreeScene } from "../IThreeScene.js";
import type { IUpdatable } from "../../../../core-threejs-app-framework/src/IUpdatable.js";
export declare abstract class SceneObjectBase implements IUpdatable {
    protected readonly root: THREE.Group;
    private readonly scene;
    private readonly sceneOwnedObjects;
    private disposed;
    protected constructor(scene: IThreeScene, rootName: string);
    update(deltaSeconds: number, elapsedSeconds: number): void;
    dispose(): void;
    protected addToRoot(...objects: readonly THREE.Object3D[]): void;
    protected addToScene(...objects: readonly THREE.Object3D[]): void;
    protected getScene(): THREE.Scene;
    protected abstract initialize(): void;
    protected onUpdate(_deltaSeconds: number, _elapsedSeconds: number): void;
    private disposeObject3D;
}
//# sourceMappingURL=SceneObjectBase.d.ts.map