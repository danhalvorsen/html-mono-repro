import * as THREE from "three";

export interface IFieldInfluence {
    sample(x: number, y: number, z: number): THREE.Vector3;
}
