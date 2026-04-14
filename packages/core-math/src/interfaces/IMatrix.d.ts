export interface IMatrix {
    multiply(mat: IMatrix): IMatrix;
    setIdentity(): void;
    transpose(): IMatrix;
    determinant(): number;
    inverse(): IMatrix | null;
    add(mat: IMatrix): IMatrix;
    subtract(mat: IMatrix): IMatrix;
    scale(scalar: number): IMatrix;
    applyToVector(vec: number[]): number[];
    toFloat32Array(): Float32Array;
    clone(): IMatrix;
    equals(mat: IMatrix, epsilon?: number): boolean;
    setFrom(mat: IMatrix): IMatrix;
}
//# sourceMappingURL=IMatrix.d.ts.map