import * as THREE from 'three';
import { IMatrix } from '@my-graphics/core-math';
import { Vector3 } from '@my-graphics/core-math';  

export class ThreeAdapter {
  static toVector3(v: Vector3): THREE.Vector3 {
    return new THREE.Vector3(v.x, v.y, v.z);
  }

  static fromVector3(v: THREE.Vector3): Vector3 {
    return new Vector3(v.x, v.y, v.z);
  }

  static toMatrix4(m: IMatrix): THREE.Matrix4 {
    const mat = new THREE.Matrix4();
    mat.fromArray(m.toFloat32Array());
    return mat;
  }
}