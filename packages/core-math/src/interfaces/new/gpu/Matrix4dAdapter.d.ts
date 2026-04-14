import { IMatrix } from "../../IMatrix.js";
import { Matrix4d } from "./matrix4d.js";
export declare class Matrix4dAdapter implements IMatrix {
    private readonly core;
    constructor(core?: Matrix4d);
    private static unwrap;
    multiply(mat: IMatrix): IMatrix;
    add(mat: IMatrix): IMatrix;
    subtract(mat: IMatrix): IMatrix;
    scale(s: number): IMatrix;
    transpose(): IMatrix;
    inverse(): IMatrix | null;
    determinant(): number;
    applyToVector(v: number[]): number[];
    toFloat32Array(): Float32Array;
    clone(): IMatrix;
    equals(mat: IMatrix, eps?: number): boolean;
    setFrom(mat: IMatrix): IMatrix;
    setIdentity(): void;
}
//# sourceMappingURL=Matrix4dAdapter.d.ts.map