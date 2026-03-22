// ============================================================================
// packages/math-core-gpu/tests/primitives/Matrix4Gpu.spec.ts
// ============================================================================

import { describe, expect, it } from "vitest";
import { Matrix4Gpu, Vector3Gpu } from "../src/index.js";
import { Matrix4GpuTestFixture } from "./Matrix4GpuTestFixture.js";

describe("Matrix4Gpu", () => {
  const fixture = new Matrix4GpuTestFixture();

  it("should create identity matrix", () => {
    const matrix = fixture.createIdentity();

    fixture.expectMatrixElements(matrix, [
      1, 0, 0, 0,
      0, 1, 0, 0,
      0, 0, 1, 0,
      0, 0, 0, 1,
    ]);
  });

  it("should create translation matrix", () => {
    const matrix = fixture.createTranslation(10, 20, 30);

    fixture.expectMatrixElements(matrix, [
      1, 0, 0, 0,
      0, 1, 0, 0,
      0, 0, 1, 0,
      10, 20, 30, 1,
    ]);
  });

  it("should create scaling matrix", () => {
    const matrix = fixture.createScaling(2, 3, 4);

    fixture.expectMatrixElements(matrix, [
      2, 0, 0, 0,
      0, 3, 0, 0,
      0, 0, 4, 0,
      0, 0, 0, 1,
    ]);
  });

  it("should multiply identity with another matrix", () => {
    const identity = fixture.createIdentity();
    const translation = fixture.createTranslation(5, 6, 7);

    const result = identity.multiply(translation) as Matrix4Gpu;

    expect(result.equals(translation)).toBe(true);
  });

  it("should multiply matrices in column-major order", () => {
    const translation = fixture.createTranslation(10, 20, 30);
    const scaling = fixture.createScaling(2, 3, 4);

    const result = translation.multiply(scaling) as Matrix4Gpu;

    fixture.expectMatrixElements(result, [
      2, 0, 0, 0,
      0, 3, 0, 0,
      0, 0, 4, 0,
      10, 20, 30, 1,
    ]);
  });

  it("should transpose matrix", () => {
    const matrix = new Matrix4Gpu([
      1, 2, 3, 4,
      5, 6, 7, 8,
      9, 10, 11, 12,
      13, 14, 15, 16,
    ]);

    const transposed = matrix.transpose() as Matrix4Gpu;

    fixture.expectMatrixElements(transposed, [
      1, 5, 9, 13,
      2, 6, 10, 14,
      3, 7, 11, 15,
      4, 8, 12, 16,
    ]);
  });

  it("should add matrices", () => {
    const left = new Matrix4Gpu([
      1, 2, 3, 4,
      5, 6, 7, 8,
      9, 10, 11, 12,
      13, 14, 15, 16,
    ]);

    const right = new Matrix4Gpu([
      10, 20, 30, 40,
      50, 60, 70, 80,
      90, 100, 110, 120,
      130, 140, 150, 160,
    ]);

    const result = left.add(right) as Matrix4Gpu;

    fixture.expectMatrixElements(result, [
      11, 22, 33, 44,
      55, 66, 77, 88,
      99, 110, 121, 132,
      143, 154, 165, 176,
    ]);
  });

  it("should subtract matrices", () => {
    const left = new Matrix4Gpu([
      10, 20, 30, 40,
      50, 60, 70, 80,
      90, 100, 110, 120,
      130, 140, 150, 160,
    ]);

    const right = new Matrix4Gpu([
      1, 2, 3, 4,
      5, 6, 7, 8,
      9, 10, 11, 12,
      13, 14, 15, 16,
    ]);

    const result = left.subtract(right) as Matrix4Gpu;

    fixture.expectMatrixElements(result, [
      9, 18, 27, 36,
      45, 54, 63, 72,
      81, 90, 99, 108,
      117, 126, 135, 144,
    ]);
  });

  it("should scale matrix by scalar", () => {
    const matrix = new Matrix4Gpu([
      1, 2, 3, 4,
      5, 6, 7, 8,
      9, 10, 11, 12,
      13, 14, 15, 16,
    ]);

    const result = matrix.scale(2) as Matrix4Gpu;

    fixture.expectMatrixElements(result, [
      2, 4, 6, 8,
      10, 12, 14, 16,
      18, 20, 22, 24,
      26, 28, 30, 32,
    ]);
  });

  it("should apply matrix to vector", () => {
    const matrix = fixture.createTranslation(10, 20, 30);
    const result = matrix.applyToVector([1, 2, 3]);

    expect(result[0]).toBeCloseTo(11, 6);
    expect(result[1]).toBeCloseTo(22, 6);
    expect(result[2]).toBeCloseTo(33, 6);
  });

  it("should clone matrix", () => {
    const matrix = fixture.createTranslation(1, 2, 3);

    const clone = matrix.clone();

    expect(clone).not.toBe(matrix);
    expect(clone.equals(matrix)).toBe(true);
  });

  it("should compare matrices with tolerance", () => {
    const left = new Matrix4Gpu([
      1, 0, 0, 0,
      0, 1, 0, 0,
      0, 0, 1, 0,
      10, 20, 30, 1,
    ]);

    const right = new Matrix4Gpu([
      1 + 1e-7, 0, 0, 0,
      0, 1 - 1e-7, 0, 0,
      0, 0, 1, 0,
      10, 20, 30, 1,
    ]);

    expect(left.equals(right, 1e-6)).toBe(true);
    expect(left.equals(right, 1e-9)).toBe(false);
  });

  it("should set from another matrix", () => {
    const source = fixture.createTranslation(7, 8, 9);
    const result = Matrix4Gpu.identity().setFrom(source) as Matrix4Gpu;

    expect(result.equals(source)).toBe(true);
    expect(result).not.toBe(source);
  });

  it("should calculate determinant of identity", () => {
    const determinant = fixture.createIdentity().determinant();

    expect(determinant).toBeCloseTo(1, 6);
  });

  it("should inverse identity", () => {
    const identity = fixture.createIdentity();
    const inverse = identity.inverse() as Matrix4Gpu;

    expect(inverse).not.toBeNull();
    expect(inverse.equals(identity)).toBe(true);
  });

  it("should inverse translation matrix", () => {
    const matrix = fixture.createTranslation(10, 20, 30);
    const inverse = matrix.inverse() as Matrix4Gpu;

    expect(inverse).not.toBeNull();

    const point = new Vector3Gpu(4, 5, 6);
    const moved = point.transform(matrix.toFloat32Array());
    const restored = moved.transform(inverse.toFloat32Array());

    fixture.expectVector(restored, point);
  });

  it("should return null for singular matrix inverse", () => {
    const singular = new Matrix4Gpu([
      1, 0, 0, 0,
      0, 0, 0, 0,
      0, 0, 1, 0,
      0, 0, 0, 1,
    ]);

    const inverse = singular.inverse();

    expect(inverse).toBeNull();
  });

  it("should create rotationX matrix", () => {
    const matrix = fixture.createRotationX(Math.PI / 2);
    const vector = fixture.createVector(0, 1, 0);

    const result = vector.transform(matrix.toFloat32Array());

    expect(result.x).toBeCloseTo(0, 6);
    expect(result.y).toBeCloseTo(0, 6);
    expect(result.z).toBeCloseTo(1, 6);
  });

  it("should create rotationY matrix", () => {
    const matrix = fixture.createRotationY(Math.PI / 2);
    const vector = fixture.createVector(0, 0, 1);

    const result = vector.transform(matrix.toFloat32Array());

    expect(result.x).toBeCloseTo(1, 6);
    expect(result.y).toBeCloseTo(0, 6);
    expect(result.z).toBeCloseTo(0, 6);
  });

  it("should create rotationZ matrix", () => {
    const matrix = fixture.createRotationZ(Math.PI / 2);
    const vector = fixture.createVector(1, 0, 0);

    const result = vector.transform(matrix.toFloat32Array());

    expect(result.x).toBeCloseTo(0, 6);
    expect(result.y).toBeCloseTo(1, 6);
    expect(result.z).toBeCloseTo(0, 6);
  });

  it("should create trs matrix", () => {
    const translation = fixture.createVector(10, 20, 30);
    const rotation = fixture.createVector(0, 0, 0);
    const scale = fixture.createVector(2, 3, 4);

    const matrix = Matrix4Gpu.trs(translation, rotation, scale);
    const result = fixture.createVector(1, 1, 1).transform(matrix.toFloat32Array());

    fixture.expectVector(result, fixture.createVector(12, 23, 34));
  });

  it("should return a defensive copy from toFloat32Array", () => {
    const matrix = fixture.createIdentity();
    const copy = matrix.toFloat32Array();

    copy[0] = 999;

    expect(matrix.toFloat32Array()[0]).toBe(1);
  });
});