// ============================================================================
// packages/math-core-gpu/tests/primitives/Vector2Gpu.spec.ts
// Includes fixture + tests in one file
// ============================================================================

import { describe, expect, it } from "vitest";
import { Vector2Gpu } from "../../src/primitives/Vector2Gpu.js";

class Vector2GpuTestFixture {
  public create(x: number = 0, y: number = 0): Vector2Gpu {
    return new Vector2Gpu(x, y);
  }

  public expectVector(
    actual: Vector2Gpu,
    expectedX: number,
    expectedY: number,
    precision: number = 6,
  ): void {
    expect(actual.x).toBeCloseTo(expectedX, precision);
    expect(actual.y).toBeCloseTo(expectedY, precision);
    expect(actual.z).toBe(0);
  }

  public expectEquals(
    actual: Vector2Gpu,
    expected: Vector2Gpu,
    tolerance?: number,
  ): void {
    expect(actual.equals(expected, tolerance)).toBe(true);
  }

  public createAffine2x3(
    m0: number,
    m1: number,
    m2: number,
    m3: number,
    m4: number,
    m5: number,
  ): Float32Array {
    return new Float32Array([m0, m1, m2, m3, m4, m5]);
  }

  public createMatrix3x3(
    m0: number,
    m1: number,
    m2: number,
    m3: number,
    m4: number,
    m5: number,
    m6: number,
    m7: number,
    m8: number,
  ): Float32Array {
    return new Float32Array([m0, m1, m2, m3, m4, m5, m6, m7, m8]);
  }
}

describe("Vector2Gpu", () => {
  const fixture = new Vector2GpuTestFixture();

  it("should create vector with x and y", () => {
    const sut = fixture.create(10, 20);

    expect(sut.x).toBe(10);
    expect(sut.y).toBe(20);
    expect(sut.z).toBe(0);
  });

  it("should expose zero constant", () => {
    fixture.expectVector(Vector2Gpu.Zero, 0, 0);
  });

  it("should expose unit x constant", () => {
    fixture.expectVector(Vector2Gpu.UnitX, 1, 0);
  });

  it("should expose unit y constant", () => {
    fixture.expectVector(Vector2Gpu.UnitY, 0, 1);
  });

  it("should create from array", () => {
    const sut = Vector2Gpu.fromArray([4, 5]);

    fixture.expectVector(sut, 4, 5);
  });

  it("should create from array with offset", () => {
    const sut = Vector2Gpu.fromArray([99, 4, 5, 100], 1);

    fixture.expectVector(sut, 4, 5);
  });

  it("should clone vector", () => {
    const source = fixture.create(2, 3);

    const clone = source.clone();

    expect(clone).not.toBe(source);
    fixture.expectEquals(clone, source);
  });

  it("should add vectors", () => {
    const left = fixture.create(2, 3);
    const right = fixture.create(4, 5);

    const result = left.add(right);

    fixture.expectVector(result, 6, 8);
  });

  it("should subtract vectors", () => {
    const left = fixture.create(10, 8);
    const right = fixture.create(3, 2);

    const result = left.subtract(right);

    fixture.expectVector(result, 7, 6);
  });

  it("should scale vector", () => {
    const sut = fixture.create(2, 3);

    const result = sut.scale(4);

    fixture.expectVector(result, 8, 12);
  });

  it("should multiply scalar", () => {
    const sut = fixture.create(2, 3);

    const result = sut.multiplyScalar(4);

    fixture.expectVector(result, 8, 12);
  });

  it("should calculate dot product", () => {
    const left = fixture.create(2, 3);
    const right = fixture.create(4, 5);

    const result = left.dot(right);

    expect(result).toBe(23);
  });

  it("should calculate cross product as pseudo z vector", () => {
    const left = fixture.create(1, 0);
    const right = fixture.create(0, 1);

    const result = left.cross(right);

    expect(result.x).toBe(0);
    expect(result.y).toBe(0);
    expect(result.z).toBe(1);
  });

  it("should calculate vector length", () => {
    const sut = fixture.create(3, 4);

    const result = sut.length();

    expect(result).toBe(5);
  });

  it("should normalize vector", () => {
    const sut = fixture.create(3, 4);

    const result = sut.normalize();

    expect(result.x).toBeCloseTo(0.6, 6);
    expect(result.y).toBeCloseTo(0.8, 6);
  });

  it("should return clone when normalizing zero vector", () => {
    const sut = fixture.create(0, 0);

    const result = sut.normalize();

    expect(result).not.toBe(sut);
    fixture.expectVector(result, 0, 0);
  });

  it("should transform using affine 2x3 matrix", () => {
    const sut = fixture.create(2, 3);
    const matrix = fixture.createAffine2x3(
      1, 0,
      0, 1,
      10, 20,
    );

    const result = sut.transform(matrix);

    fixture.expectVector(result, 12, 23);
  });

  it("should transform using 3x3 matrix", () => {
    const sut = fixture.create(2, 3);
    const matrix = fixture.createMatrix3x3(
      1, 0, 0,
      0, 1, 0,
      10, 20, 1,
    );

    const result = sut.transform(matrix);

    fixture.expectVector(result, 12, 23);
  });

  it("should throw for unsupported matrix size", () => {
    const sut = fixture.create(2, 3);

    expect(() => sut.transform(new Float32Array([1, 2, 3, 4]))).toThrow(
      "Vector2Gpu.transform expects a 2x3 or 3x3 matrix.",
    );
  });

  it("should calculate angle to another vector", () => {
    const left = fixture.create(1, 0);
    const right = fixture.create(0, 1);

    const result = left.angleTo(right);

    expect(result).toBeCloseTo(Math.PI / 2, 6);
  });

  it("should return zero angle when one vector has zero length", () => {
    const left = fixture.create(0, 0);
    const right = fixture.create(1, 0);

    const result = left.angleTo(right);

    expect(result).toBe(0);
  });

  it("should project onto another vector", () => {
    const source = fixture.create(3, 4);
    const onto = fixture.create(1, 0);

    const result = source.projectOnto(onto);

    fixture.expectVector(result, 3, 0);
  });

  it("should return zero vector when projecting onto zero vector", () => {
    const source = fixture.create(3, 4);
    const onto = fixture.create(0, 0);

    const result = source.projectOnto(onto);

    fixture.expectVector(result, 0, 0);
  });

  it("should reflect across normal", () => {
    const source = fixture.create(1, -1);
    const normal = fixture.create(0, 1);

    const result = source.reflect(normal);

    fixture.expectVector(result, 1, 1);
  });

  it("should linearly interpolate", () => {
    const from = fixture.create(0, 0);
    const to = fixture.create(10, 20);

    const result = from.lerp(to, 0.25);

    fixture.expectVector(result, 2.5, 5);
  });

  it("should calculate distance to another vector", () => {
    const left = fixture.create(0, 0);
    const right = fixture.create(3, 4);

    const result = left.distanceTo(right);

    expect(result).toBe(5);
  });

  it("should compare equality with default tolerance", () => {
    const left = fixture.create(1, 2);
    const right = fixture.create(1 + 1e-7, 2 - 1e-7);

    expect(left.equals(right)).toBe(true);
  });

  it("should compare equality with explicit tolerance", () => {
    const left = fixture.create(1, 2);
    const right = fixture.create(1.01, 2.01);

    expect(left.equals(right, 0.02)).toBe(true);
    expect(left.equals(right, 0.001)).toBe(false);
  });

  it("should convert to array", () => {
    const sut = fixture.create(7, 8);

    const result = sut.toArray();

    expect(result).toEqual([7, 8]);
  });

  it("should convert to float32 array", () => {
    const sut = fixture.create(7, 8);

    const result = sut.toFloat32Array();

    expect(result).toBeInstanceOf(Float32Array);
    expect(Array.from(result)).toEqual([7, 8]);
  });

  it("should keep operations immutable", () => {
    const sut = fixture.create(2, 3);

    sut.add(fixture.create(1, 1));
    sut.subtract(fixture.create(1, 1));
    sut.scale(5);
    sut.normalize();

    fixture.expectVector(sut, 2, 3);
  });
});