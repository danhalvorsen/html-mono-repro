// ============================================================================
// packages/math-core-gpu/src/contracts/IVectorGpu.ts
// ============================================================================

export interface IVectorGpu<T> {
  readonly x: number;
  readonly y: number;
  readonly z: number;

  add(v: T): T;
  subtract(v: T): T;
  scale(scalar: number): T;
  dot(v: T): number;
  cross(v: T): T;
  length(): number;
  normalize(): T;
  clone(): T;
  transform(matrix: Float32Array | number[]): T;

  angleTo(v: T): number;
  projectOnto(v: T): T;
  reflect(normal: T): T;
  lerp(v: T, t: number): T;

  distanceTo(v: T): number;
  equals(v: T, tolerance?: number): boolean;
  toArray(): number[];
  toFloat32Array(): Float32Array;
}

// ============================================================================
// packages/math-core-gpu/src/contracts/IMatrixGpu.ts
// ============================================================================

export interface IMatrixGpu {
  multiply(mat: IMatrixGpu): IMatrixGpu;
  setIdentity(): void;
  transpose(): IMatrixGpu;
  determinant(): number;
  inverse(): IMatrixGpu | null;
  add(mat: IMatrixGpu): IMatrixGpu;
  subtract(mat: IMatrixGpu): IMatrixGpu;
  scale(scalar: number): IMatrixGpu;
  applyToVector(vec: number[]): number[];
  toFloat32Array(): Float32Array;
  clone(): IMatrixGpu;
  equals(mat: IMatrixGpu, epsilon?: number): boolean;
  setFrom(mat: IMatrixGpu): IMatrixGpu;
}

