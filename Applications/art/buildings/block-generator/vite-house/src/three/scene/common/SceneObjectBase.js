// ====================================================================================
// FILE: src/three/core/scene/common/SceneObjectBase.ts
// REPLACE THE WHOLE FILE
// ====================================================================================
import * as THREE from "three";
export class SceneObjectBase {
    root;
    scene;
    sceneOwnedObjects = new Set();
    disposed = false;
    constructor(scene, rootName) {
        this.scene = scene;
        this.root = new THREE.Group();
        this.root.name = rootName;
        this.scene.getScene().add(this.root);
    }
    update(deltaSeconds, elapsedSeconds) {
        if (this.disposed) {
            return;
        }
        this.onUpdate(deltaSeconds, elapsedSeconds);
    }
    dispose() {
        if (this.disposed) {
            return;
        }
        this.disposeObject3D(this.root);
        this.scene.getScene().remove(this.root);
        for (const object of this.sceneOwnedObjects) {
            this.disposeObject3D(object);
            this.scene.getScene().remove(object);
        }
        this.sceneOwnedObjects.clear();
        this.disposed = true;
    }
    addToRoot(...objects) {
        for (const object of objects) {
            this.root.add(object);
        }
    }
    addToScene(...objects) {
        for (const object of objects) {
            this.scene.getScene().add(object);
            this.sceneOwnedObjects.add(object);
        }
    }
    getScene() {
        return this.scene.getScene();
    }
    onUpdate(_deltaSeconds, _elapsedSeconds) {
        // optional
    }
    disposeObject3D(object) {
        object.traverse((node) => {
            const mesh = node;
            if (mesh.geometry !== undefined) {
                mesh.geometry.dispose();
            }
            const material = mesh.material;
            if (Array.isArray(material)) {
                for (const item of material) {
                    item.dispose();
                }
            }
            else if (material !== undefined) {
                material.dispose();
            }
        });
    }
}
//# sourceMappingURL=SceneObjectBase.js.map