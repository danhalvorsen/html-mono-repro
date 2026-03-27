// ============================================================================
// FIX 2
// FILE: packages/core-design-pattern-composite-tree-threejs/src/TransformNode.ts
// ============================================================================

import * as THREE from "three";
import type { IPrimitiveNode } from "./IPrimitiveNode.js";
import type { INodeTransform } from "./INodeTransform.js";
export class TransformNode implements IPrimitiveNode {
  private readonly position: THREE.Vector3;
  private readonly rotation: THREE.Euler;
  private readonly scale: THREE.Vector3;

  public constructor(
    public readonly name: string,
    private readonly inner: IPrimitiveNode,
    transform?: INodeTransform,
  ) {
    this.position = transform?.position?.clone() ?? new THREE.Vector3(0, 0, 0);
    this.rotation = transform?.rotation?.clone() ?? new THREE.Euler(0, 0, 0);
    this.scale = transform?.scale?.clone() ?? new THREE.Vector3(1, 1, 1);
  }

  public operation(): void {
    this.inner.operation();
  }

  public instantiate(): THREE.Object3D {
    const instance = this.inner.instantiate();
    instance.name = this.name;
    instance.position.copy(this.position);
    instance.rotation.copy(this.rotation);
    instance.scale.copy(this.scale);
    return instance;
  }

  public cloneNode(): IPrimitiveNode {
    return new TransformNode(
      this.name,
      this.inner.cloneNode(),
      {
        position: this.position.clone(),
        rotation: this.rotation.clone(),
        scale: this.scale.clone(),
      },
    );
  }

  public getChildren(): readonly IPrimitiveNode[] {
    return [this.inner];
  }
}