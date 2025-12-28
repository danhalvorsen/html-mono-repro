import { Matrix4d } from '../../src/interfaces/new/gpu/matrix4d.js'
import { Vector3d } from '../../src/interfaces/new/gpu/vector.js'
import { describe, it, expect } from 'vitest';

describe('Matrix4d', () => {

  it('initializes as identity matrix', () => {
    const m = new Matrix4d();
    const e = m.toFloat32Array();

    expect(e[0]).toBe(1);
    expect(e[5]).toBe(1);
    expect(e[10]).toBe(1);
    expect(e[15]).toBe(1);
  });

  it('multiplies two identity matrices correctly', () => {
    const a = new Matrix4d();
    const b = new Matrix4d();

    a.multiply(b);

    expect(a.equals(new Matrix4d())).toBe(true);
  });

it('applies translation to a vector', () => {
  const m = new Matrix4d();

  // manual translation
  const e = m.toFloat32Array();
  e[12] = 10;
  e[13] = 20;
  e[14] = 30;

  const v = [1, 2, 3, 1];
  m.applyToVector(v);

  expect(v[0]).toBe(11);
  expect(v[1]).toBe(22);
  expect(v[2]).toBe(33);
});

  it('clone creates a deep copy', () => {
    const m1 = new Matrix4d();
    const e = m1.toFloat32Array();
    e[12] = 5;

    const m2 = m1.clone();

    e[12] = 10; // mutate original

    expect(m2.toFloat32Array()[12]).toBe(5);
  });

  it('transpose swaps rows and columns', () => {
    const m = new Matrix4d();
    const e = m.toFloat32Array();

    e[1] = 2;
    e[4] = 3;

    m.transpose();

    expect(e[1]).toBe(3);
    expect(e[4]).toBe(2);
  });

});
