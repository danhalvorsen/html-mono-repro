import * as THREE from "three";
import { VectorField } from "../VectorField.js";

export interface IGeometryStrategy {
    buildPoints(
        field: VectorField,
        start: THREE.Vector3,
        steps: number,
        stepSize: number
    ): THREE.Vector3[];
}