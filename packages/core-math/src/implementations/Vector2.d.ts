import { IVector } from '../interfaces/IVector.js';
export declare class Vector2 implements IVector<Vector2> {
    x: number;
    y: number;
    z: number;
    constructor(x: number, y: number, z?: number);
    add(v: Vector2): Vector2;
    subtract(v: Vector2): Vector2;
    scale(scalar: number): Vector2;
    dot(v: Vector2): number;
    cross(v: Vector2): Vector2;
    length(): number;
    normalize(): Vector2;
    transform(matrix: Float32Array | number[]): Vector2;
    clone(): Vector2;
    angleTo(v: Vector2): number;
    projectOnto(v: Vector2): Vector2;
    reflect(normal: Vector2): Vector2;
    lerp(v: Vector2, t: number): Vector2;
    distanceTo(v: Vector2): number;
    equals(v: Vector2, tolerance?: number): boolean;
    toArray(): number[];
    multiplyScalar(scalar: number): Vector2;
}
//# sourceMappingURL=Vector2.d.ts.map