
import * as THREE from "three";

export type SquareSemantic =
  | "Left"
  | "Left.Top"
  | "Left.Mid"
  | "Left.Bottom"
  | "Top"
  | "Top.Left"
  | "Top.Mid"
  | "Top.Right"
  | "Bottom"
  | "Bottom.Left"
  | "Bottom.Mid"
  | "Bottom.Right"
  | "Right"
  | "Right.Top"
  | "Right.Mid"
  | "Right.Bottom";
export interface ISquare {
  readonly size: number;
  readonly localMatrix: THREE.Matrix4;
  readonly worldMatrix: THREE.Matrix4;

  updateWorld(parentWorld: THREE.Matrix4): void;
  getLocalAnchor(semantic: SquareSemantic): THREE.Vector3;
  getWorldAnchor(semantic: SquareSemantic): THREE.Vector3;
}

export class Square implements ISquare {
  public readonly size: number;
  public readonly localMatrix: THREE.Matrix4;
  public readonly worldMatrix: THREE.Matrix4;

  public constructor(
    localMatrix?: THREE.Matrix4,
    size: number = 1,
  ) {
    if (size <= 0) {
      throw new Error("Square size must be greater than zero.");
    }

    this.size = size;
    this.localMatrix = localMatrix?.clone() ?? new THREE.Matrix4().identity();
    this.worldMatrix = this.localMatrix.clone();
  }

  public updateWorld(parentWorld: THREE.Matrix4): void {
    this.worldMatrix.multiplyMatrices(parentWorld, this.localMatrix);
  }

  public getLocalAnchor(semantic: SquareSemantic): THREE.Vector3 {
    const half = this.size / 2;

    switch (semantic) {
      case "Left":
      case "Left.Mid":
        return new THREE.Vector3(-half, 0, 0);

      case "Left.Top":
        return new THREE.Vector3(-half, half, 0);

      case "Left.Bottom":
        return new THREE.Vector3(-half, -half, 0);

      case "Top":
      case "Top.Mid":
        return new THREE.Vector3(0, half, 0);

      case "Top.Left":
        return new THREE.Vector3(-half, half, 0);

      case "Top.Right":
        return new THREE.Vector3(half, half, 0);

      case "Bottom":
      case "Bottom.Mid":
        return new THREE.Vector3(0, -half, 0);

      case "Bottom.Left":
        return new THREE.Vector3(-half, -half, 0);

      case "Bottom.Right":
        return new THREE.Vector3(half, -half, 0);

      case "Right":
      case "Right.Mid":
        return new THREE.Vector3(half, 0, 0);

      case "Right.Top":
        return new THREE.Vector3(half, half, 0);

      case "Right.Bottom":
        return new THREE.Vector3(half, -half, 0);
    }
  }

  public getWorldAnchor(semantic: SquareSemantic): THREE.Vector3 {
    return this.getLocalAnchor(semantic).applyMatrix4(this.worldMatrix);
  }
}