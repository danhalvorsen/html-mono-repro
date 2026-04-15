import { IMatrix } from '../interfaces/IMatrix.js';
export declare class Matrix implements IMatrix {
    static translation(tx: number, ty: number): Matrix;
    static rotation(angle: number): Matrix;
    static scaling(sx: number, sy: number): Matrix;
    private data;
    private size;
    constructor(data: number[][]);
    static fromFlatData(flat: Float32Array, size: number): Matrix;
    static identity(size: number): Matrix;
    clone(): IMatrix;
    multiply(mat: IMatrix): IMatrix;
    setIdentity(): void;
    transpose(): IMatrix;
    determinant(): number;
    inverse(): IMatrix | null;
    add(mat: IMatrix): IMatrix;
    subtract(mat: IMatrix): IMatrix;
    scale(scalar: number): IMatrix;
    applyToVector(vec: number[]): number[];
    setFrom(mat: IMatrix): IMatrix;
    equals(mat: IMatrix, epsilon?: number): boolean;
    toFloat32Array(): Float32Array;
    private getSubMatrix;
    static extractEulerAngles(m: IMatrix): {
        x: number;
        y: number;
        z: number;
    };
}
//# sourceMappingURL=Matrix4.d.ts.map