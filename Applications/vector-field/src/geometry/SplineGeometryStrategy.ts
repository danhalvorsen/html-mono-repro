import * as THREE from "three";
import { IGeometryStrategy } from "./IGeometryStrategy.js"
import { VectorField } from "../VectorField.js";

export class SplineGeometryStrategy implements IGeometryStrategy {
    constructor(private smoothness: number = 30) {}

    buildPoints(
        field: VectorField,
        start: THREE.Vector3,
        steps: number,
        stepSize: number
    ): THREE.Vector3[] {

        const pts: THREE.Vector3[] = [];
        let x = start.x, y = start.y, z = start.z;

        for (let i = 0; i < steps; i++) {
            pts.push(new THREE.Vector3(x, y, z));
            const v = field.sample(x, y, z);
            x += v.x * stepSize;
            y += v.y * stepSize;
            z += v.z * stepSize;
        }

        const curve = new THREE.CatmullRomCurve3(pts);
        return curve.getPoints(this.smoothness);
    }
}
