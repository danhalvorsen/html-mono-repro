import * as THREE from "three";

export interface INodeTransform {
  readonly position?: THREE.Vector3;
  readonly rotation?: THREE.Euler;
  readonly scale?: THREE.Vector3;
}