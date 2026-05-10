import { Vector2 } from '@monorepo/core-math';
import { describe, expect, it } from 'vitest';
import { ReferenceCurve } from '../src/ReferenceCurve.js';

describe('ReferenceCurve', () => {
  it('should expose start point', () => {
    const curve = new ReferenceCurve([
      new Vector2(0, 10),
      new Vector2(1, 20),
    ]);

    expect(curve.getStartPoint().x).toBe(0);
    expect(curve.getStartPoint().y).toBe(10);
  });

  it('should expose center point', () => {
    const curve = new ReferenceCurve([
      new Vector2(0, 10),
      new Vector2(1, 20),
      new Vector2(2, 30),
    ]);

    expect(curve.getCenterPoint().x).toBe(1);
    expect(curve.getCenterPoint().y).toBe(20);
  });

  it('should find nearest point by x', () => {
    const curve = new ReferenceCurve([
      new Vector2(0, 10),
      new Vector2(10, 20),
      new Vector2(20, 30),
    ]);

    const point = curve.findNearestPointByX(12);

    expect(point.x).toBe(10);
    expect(point.y).toBe(20);
  });

  it('should reject fewer than two points', () => {
    expect(() => new ReferenceCurve([new Vector2(0, 10)])).toThrow(
      'ReferenceCurve requires at least 2 points.',
    );
  });
});
