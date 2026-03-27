// ====================================================================================
// FILE: src/three/core/scene/common/SceneObjectBase.ts
// REPLACE THE WHOLE FILE
// ====================================================================================

import * as THREE from "three";
import type { IThreeScene } from "../IThreeScene.js";
import type { IUpdatable } from "../../../../core-threejs-app-framework/src/IUpdatable.js";

export abstract class SceneObjectBase implements IUpdatable {
  protected readonly root: THREE.Group;
  private readonly scene: IThreeScene;
  private readonly sceneOwnedObjects = new Set<THREE.Object3D>();
  private disposed = false;

  protected constructor(
    scene: IThreeScene,
    rootName: string,
  ) {
    this.scene = scene;
    this.root = new THREE.Group();
    this.root.name = rootName;

    this.scene.getScene().add(this.root);
  }

  public update(deltaSeconds: number, elapsedSeconds: number): void {
    if (this.disposed) {
      return;
    }

    this.onUpdate(deltaSeconds, elapsedSeconds);
  }

  public dispose(): void {
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

  protected addToRoot(...objects: readonly THREE.Object3D[]): void {
    for (const object of objects) {
      this.root.add(object);
    }
  }

  protected addToScene(...objects: readonly THREE.Object3D[]): void {
    for (const object of objects) {
      this.scene.getScene().add(object);
      this.sceneOwnedObjects.add(object);
    }
  }

  protected getScene(): THREE.Scene {
    return this.scene.getScene();
  }

  protected abstract initialize(): void;

  protected onUpdate(_deltaSeconds: number, _elapsedSeconds: number): void {
    // optional
  }

  private disposeObject3D(object: THREE.Object3D): void {
    object.traverse((node) => {
      const mesh = node as THREE.Mesh;

      if (mesh.geometry !== undefined) {
        mesh.geometry.dispose();
      }

      const material = mesh.material;
      if (Array.isArray(material)) {
        for (const item of material) {
          item.dispose();
        }
      } else if (material !== undefined) {
        material.dispose();
      }
    });
  }
}