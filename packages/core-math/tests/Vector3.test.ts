// File: tests/Vector3.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { Vector3 } from '../src/implementations/Vector3.js'

// Reusable comparison helper
function expectVectorCloseTo(
  actual: Vector3,
  expected: Vector3,
  tolerance = 1e-6
) {
  expect(actual.x).toBeCloseTo(expected.x, tolerance);
  expect(actual.y).toBeCloseTo(expected.y, tolerance);
  expect(actual.z).toBeCloseTo(expected.z, tolerance);
}

describe('Vector3', () => {
  let vZero: Vector3;
  let vOne: Vector3;
  let vA: Vector3;
  let vB: Vector3;

  beforeEach(() => {
    vZero = new Vector3(0, 0, 0);
    vOne = new Vector3(1, 1, 1);
    vA = new Vector3(1, 2, 3);
    vB = new Vector3(4, 5, 6);
  });

  it('adds vectors correctly', () => {
    expectVectorCloseTo(vA.add(vB), new Vector3(5, 7, 9));
  });

  it('subtracts vectors', () => {
    expectVectorCloseTo(vB.subtract(vA), new Vector3(3, 3, 3));
  });

  it('scales vectors', () => {
    expectVectorCloseTo(vA.scale(2), new Vector3(2, 4, 6));
  });

  it('returns dot product', () => {
    expect(new Vector3(1, 0, 0).dot(new Vector3(0, 1, 0))).toBe(0);
  });

  it('returns cross product', () => {
    const result = new Vector3(1, 0, 0).cross(new Vector3(0, 1, 0));
    expectVectorCloseTo(result, new Vector3(0, 0, 1));
  });

  it('returns length', () => {
    expect(new Vector3(3, 4, 12).length()).toBe(13);
  });

  it('normalizes correctly', () => {
    const v = new Vector3(3, 0, 0).normalize();
    expectVectorCloseTo(v, new Vector3(1, 0, 0));
  });

  it('handles zero normalization', () => {
    expectVectorCloseTo(vZero.normalize(), vZero);
  });

  it('transforms with identity matrix', () => {
    const identity = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
    expectVectorCloseTo(vA.transform(identity), vA);
  });

  it('clones vector', () => {
    const clone = vA.clone();
    expect(clone).not.toBe(vA);
    expectVectorCloseTo(clone as Vector3, vA);
  });

  it('calculates angle between vectors', () => {
    const angle = new Vector3(1, 0, 0).angleTo(new Vector3(0, 1, 0));
    expect(angle).toBeCloseTo(Math.PI / 2);
  });

  it('returns 0 angle with zero vector', () => {
    expect(vZero.angleTo(vA)).toBe(0);
  });

  it('projects vector onto another', () => {
    const result = new Vector3(2, 2, 0).projectOnto(new Vector3(1, 0, 0));
    expectVectorCloseTo(result, new Vector3(2, 0, 0));
  });

  it('reflects vector correctly', () => {
    const result = new Vector3(1, -1, 0).reflect(new Vector3(0, 1, 0));
    expectVectorCloseTo(result, new Vector3(1, 1, 0));
  });

  it('lerps correctly', () => {
    const result = vZero.lerp(new Vector3(10, 0, 0), 0.5);
    expectVectorCloseTo(result, new Vector3(5, 0, 0));
  });

  it('calculates distance between vectors', () => {
    const result = vA.distanceTo(new Vector3(4, 6, 3));
    expect(result).toBeCloseTo(5);
  });

  it('checks equality within tolerance', () => {
    const almost = new Vector3(1.0000001, 1.0000002, 1.0000001);
    expect(vOne.equals(almost)).toBe(true);
  });

  it('converts to array', () => {
    expect(vA.toArray()).toEqual([1, 2, 3]);
  });
});
