import { IMatrix } from "../../IMatrix.js";
export declare class Matrix4d implements IMatrix {
    private readonly e;
    constructor();
    setIdentity(): void;
    multiply(m: IMatrix): IMatrix;
    transpose(): IMatrix;
    add(m: IMatrix): IMatrix;
    subtract(m: IMatrix): IMatrix;
    scale(s: number): IMatrix;
    applyToVector(v: number[]): number[];
    toFloat32Array(): Float32Array;
    clone(): IMatrix;
    equals(m: IMatrix, eps?: number): boolean;
    setFrom(m: IMatrix): IMatrix;
    determinant(): number;
    inverse(): IMatrix | null;
}
//# sourceMappingURL=matrix4d.d.ts.map