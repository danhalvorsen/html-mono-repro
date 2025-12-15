
import { describe, it, expect, beforeEach } from 'vitest';
import { Matrix } from '../src/implementations/Matrix4.js';
import { IMatrix } from '../src/interfaces/IMatrix.js';

// 🔧 Helper for tolerance-based float comparison
function float32Equal(
  a: Float32Array,
  b: Float32Array,
  epsilon = 1e-6
): boolean {
  if (a.length !== b.length) return false;
  return a.every((val, i) => Math.abs(val - b[i]) <= epsilon);
}

// ✅ Identity behavior
it('should set the matrix to identity', () => {
  const m = new Matrix([
    [9, 8],
    [7, 6],
  ]);
  m.setIdentity();
  expect(m.toFloat32Array()).toEqual(new Float32Array([1, 0, 0, 1]));
});

// ✅ Matrix equality
it('should set matrix from another matrix', () => {
  const m1 = new Matrix([
    [2, 3],
    [4, 5],
  ]);
  const m2 = new Matrix([
    [0, 0],
    [0, 0],
  ]);
  m2.setFrom(m1);
  expect(m2.toFloat32Array()).toEqual(m1.toFloat32Array());
  expect(m2).not.toBe(m1);
});

// ✅ Core matrix operations
describe('Matrix Operations', () => {
  let matA: IMatrix;
  let matB: IMatrix;
  let identity: IMatrix;

  beforeEach(() => {
    matA = new Matrix([
      [1, 2],
      [3, 4],
    ]);

    matB = new Matrix([
      [5, 6],
      [7, 8],
    ]);

    identity = new Matrix([
      [1, 0],
      [0, 1],
    ]);
  });

  it('should multiply two matrices', () => {
    const result = matA.multiply(matB);
    expect(result.toFloat32Array()).toEqual(new Float32Array([19, 22, 43, 50]));
  });

  it('should add two matrices', () => {
    const result = matA.add(matB);
    expect(result.toFloat32Array()).toEqual(new Float32Array([6, 8, 10, 12]));
  });

  it('should subtract two matrices', () => {
    const result = matA.subtract(matB);
    expect(result.toFloat32Array()).toEqual(new Float32Array([-4, -4, -4, -4]));
  });

  it('should scale a matrix by a scalar', () => {
    const result = matA.scale(2);
    expect(result.toFloat32Array()).toEqual(new Float32Array([2, 4, 6, 8]));
  });

  it('should transpose a matrix', () => {
    const result = matA.transpose();
    expect(result.toFloat32Array()).toEqual(new Float32Array([1, 3, 2, 4]));
  });

  it('should compute the determinant', () => {
    expect(matA.determinant()).toBe(-2);
    expect(identity.determinant()).toBe(1);
  });

  it('should compute the inverse of a 2x2 matrix', () => {
    const inverseA = matA.inverse();
    expect(
      float32Equal(
        inverseA!.toFloat32Array(),
        new Float32Array([-2, 1, 1.5, -0.5])
      )
    ).toBe(true);

    const singularMatrix = new Matrix([
      [2, 4],
      [1, 2],
    ]);
    expect(singularMatrix.inverse()).toBeNull();
  });

  it('should return original when multiplied by identity', () => {
    const result = matA.multiply(identity);
    expect(result.toFloat32Array()).toEqual(matA.toFloat32Array());
  });

  it('should apply matrix to vector', () => {
    const vector = [1, 2];
    const result = matA.applyToVector(vector);
    expect(result).toEqual([5, 11]);
  });

  it('should clone a matrix', () => {
    const clone = matA.clone();
    expect(clone.toFloat32Array()).toEqual(matA.toFloat32Array());
    expect(clone).not.toBe(matA);
  });
});
