import { Line } from '../src/implementations/Line.js';
import { Vector3 } from '../src/implementations/Vector3.js';

import { describe, it, expect } from 'vitest';

describe('Line<Vector3>', () => {
  const A = new Vector3(0, 0, 0);
  const B = new Vector3(10, 0, 0);
  const line = new Line(A, B);

  it('should return correct direction', () => {
    const dir = line.direction();
    expect(dir.x).toBeCloseTo(1);
    expect(dir.y).toBeCloseTo(0);
    expect(dir.z).toBeCloseTo(0);
  });

  it('should return correct length', () => {
    expect(line.length()).toBeCloseTo(10);
  });

  it('should interpolate points correctly', () => {
    const mid = line.getPoint(0.5);
    expect(mid.x).toBeCloseTo(5);
    expect(mid.y).toBeCloseTo(0);
    expect(mid.z).toBeCloseTo(0);
  });

  it('should return closest point for point on line', () => {
    const p = new Vector3(7, 0, 0);
    const closest = line.closestPointTo(p);
    expect(closest.equals(p)).toBe(true);
  });

  it('should return closest point for point off the line', () => {
    const p = new Vector3(5, 5, 0);
    const closest = line.closestPointTo(p);
    expect(closest.x).toBeCloseTo(5);
    expect(closest.y).toBeCloseTo(0);
    expect(closest.z).toBeCloseTo(0);
  });

  it('should clamp to A when closest point is before segment start', () => {
    const p = new Vector3(-5, 0, 0);
    const closest = line.closestPointTo(p);
    expect(closest.equals(A)).toBe(true);
  });

  it('should clamp to B when closest point is after segment end', () => {
    const p = new Vector3(15, 0, 0);
    const closest = line.closestPointTo(p);
    expect(closest.equals(B)).toBe(true);
  });

  it('should handle degenerate line (A == B)', () => {
    const flatLine = new Line(A, A.clone());
    const closest = flatLine.closestPointTo(new Vector3(1, 1, 1));
    expect(closest.equals(A)).toBe(true);
  });
});
