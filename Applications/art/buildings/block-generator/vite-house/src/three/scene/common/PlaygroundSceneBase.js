// ====================================================================================
// FILE: src/three/core/scene/common/PlaygroundSceneBase.ts
// PURPOSE:
// - shared demo/playground defaults
// - keeps SceneObjectBase infrastructure-only
// - removes repeated light/ground boilerplate
// ====================================================================================
import * as THREE from "three";
import { SceneObjectBase } from "./SceneObjectBase.js";
import { MaterialToken } from "../../../../core-threejs-app-framework/src/Materials/MaterialToken.js";
export class PlaygroundSceneBase extends SceneObjectBase {
    materialFactory;
    constructor(scene, rootName, materialFactory) {
        super(scene, rootName);
        this.materialFactory = materialFactory;
        this.initialize();
    }
    initialize() {
        this.createDefaultLights();
        this.createDefaultGround();
        this.createContent();
    }
    createDefaultLights() {
        const ambient = new THREE.AmbientLight(0xffffff, 1.35);
        const sun = new THREE.DirectionalLight(0xffffff, 2.0);
        sun.position.set(10, 16, 10);
        sun.castShadow = true;
        sun.shadow.mapSize.set(2048, 2048);
        sun.shadow.camera.left = -20;
        sun.shadow.camera.right = 20;
        sun.shadow.camera.top = 20;
        sun.shadow.camera.bottom = -20;
        sun.shadow.camera.near = 0.5;
        sun.shadow.camera.far = 80;
        this.addToScene(ambient, sun);
    }
    createDefaultGround(width = 20, height = 1, depth = 20) {
        const ground = new THREE.Mesh(new THREE.BoxGeometry(width, height, depth), this.materialFactory.create(MaterialToken.Grass));
        ground.position.set(0, -(height / 2), 0);
        ground.receiveShadow = true;
        this.addToScene(ground);
    }
    createContent() {
        // default no-op so subclasses are not forced to implement content
    }
}
//# sourceMappingURL=PlaygroundSceneBase.js.map