import * as THREE from "three";
import { type IFieldInfluence } from "./IFieldInfluence.js";

export class CurlInfluence implements IFieldInfluence {
    constructor(private strength: number) {}

    sample(x: number, y: number, z: number): THREE.Vector3 {
        // reference z to avoid TS6133 "declared but never read"
        void z;

        return new THREE.Vector3(
            -y * this.strength,
             x * this.strength,
             0
        );
    }
}
