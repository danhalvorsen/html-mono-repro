import { IVector } from "../interfaces/IVector.js";
export declare class Vector3 implements IVector<Vector3> {
    x: number;
    y: number;
    z: number;
    constructor(x: number, y: number, z: number);
    add(v: Vector3): Vector3;
    /*************  ✨ Windsurf Command ⭐  *************/
    /**
     * Returns a new Vector3 that is the result of subtracting the given vector
     * from this vector.
     * @param v The vector to subtract.
     * @returns A new Vector3 that is the result of the subtraction.
     */
    /*******  8aa1f985-38e4-4051-b146-3a758a210ce0  *******/ subtract(v: Vector3): Vector3;
    scale(scalar: number): Vector3;
    dot(v: Vector3): number;
    cross(v: Vector3): Vector3;
    length(): number;
    normalize(): Vector3;
    transform(matrix: Float32Array | number[]): Vector3;
    clone(): Vector3;
    angleTo(v: Vector3): number;
    projectOnto(v: Vector3): Vector3;
    reflect(normal: Vector3): Vector3;
    lerp(v: Vector3, t: number): Vector3;
    distanceTo(v: Vector3): number;
    equals(v: Vector3, tolerance?: number): boolean;
    toArray(): number[];
    multiplyScalar(scalar: number): Vector3;
}
//# sourceMappingURL=Vector3.d.ts.map