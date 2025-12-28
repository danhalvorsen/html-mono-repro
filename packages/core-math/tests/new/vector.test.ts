 
import { describe, it, expect } from 'vitest';
 
import { Vector3dAdapter } from '../../src/interfaces/new/gpu/vector3dAdapter.js'
import { Vector3d } from '../../src/interfaces/new/gpu/vector.js'
 
describe('Vector3dAdapter', () => {
  it('normalizes without mutating the original vector', () => {
    const subject = new Vector3dAdapter(new Vector3d(0, 3, 4));

    const result = subject.normalize();

    expect(result.length()).toBeCloseTo(1, 1e-6);
    expect(subject.length()).toBe(5);
  });

  it('computes cross product correctly', () => {
    const a = new Vector3dAdapter(new Vector3d(1, 0, 0));
    const b = new Vector3dAdapter(new Vector3d(0, 1, 0));

    const r = a.cross(b);

    expect(r.x).toBe(0);
    expect(r.y).toBe(0);
    expect(r.z).toBe(1);
  });
});
