import * as THREE from "three";
import { IFieldInfluence } from "./IFieldInfluence.js";

export class GradientInfluence implements IFieldInfluence {
    constructor(private target: THREE.Vector3, private strength: number) {}

    sample(x: number, y: number, z: number): THREE.Vector3 {
        const v = this.target.clone().sub(new THREE.Vector3(x, y, z));
        v.normalize().multiplyScalar(this.strength);
        return v;
    }
}
