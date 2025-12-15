import * as THREE from "three";
import type { IFieldInfluence } from "./IFieldInfluence.js";

export class NoiseInfluence implements IFieldInfluence {
    constructor(private scale: number, private zStrength: number) {}

    sample(x: number, y: number, z: number): THREE.Vector3 {
        const nx = (Math.sin(x * this.scale) + Math.cos(y * this.scale)) * 0.5;
        const ny = (Math.sin(y * this.scale) - Math.cos(x * this.scale)) * 0.5;
        const nz = Math.sin(z * this.scale) * this.zStrength;
        return new THREE.Vector3(nx, ny, nz);
    }
}
