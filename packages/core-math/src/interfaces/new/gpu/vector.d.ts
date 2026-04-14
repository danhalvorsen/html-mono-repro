export declare class Vector3d {
    x: number;
    y: number;
    z: number;
    constructor(x?: number, y?: number, z?: number);
    set(x: number, y: number, z: number): this;
    copy(v: Vector3d): this;
    add(v: Vector3d): this;
    sub(v: Vector3d): this;
    dot(v: Vector3d): number;
    cross(v: Vector3d): this;
    length(): number;
    normalize(): this;
    clone(): Vector3d;
    toFloat32Array(): Float32Array;
}
//# sourceMappingURL=vector.d.ts.map