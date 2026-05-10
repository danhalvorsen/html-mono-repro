import { Vector2 } from '@monorepo/core-math';
import { describe, expect, it } from 'vitest';
import { TriangleStrip } from '../src/TriangleStrip.js';

describe('TriangleStrip', () => {
  it('should create a closed polygon from two parallel lines', () => {
    const upperPoints = [
      new Vector2(0, 10),
      new Vector2(1, 10),
    ];

    const lowerPoints = [
      new Vector2(0, -10),
      new Vector2(1, -10),
    ];

    const polygon = new TriangleStrip(upperPoints, lowerPoints).create();

    expect(polygon.closed).toBe(true);
    expect(polygon.points).toHaveLength(5);

    expect(polygon.points[0]?.equals(new Vector2(0, 10))).toBe(true);
    expect(polygon.points[1]?.equals(new Vector2(1, 10))).toBe(true);
    expect(polygon.points[2]?.equals(new Vector2(1, -10))).toBe(true);
    expect(polygon.points[3]?.equals(new Vector2(0, -10))).toBe(true);
    expect(polygon.points[4]?.equals(new Vector2(0, 10))).toBe(true);
  });

  it('should reject fewer than two upper points', () => {
    const upperPoints = [
      new Vector2(0, 10),
    ];

    const lowerPoints = [
      new Vector2(0, -10),
    ];

    expect(() => new TriangleStrip(upperPoints, lowerPoints).create()).toThrow(
      'TriangleStrip requires at least 2 upper points.',
    );
  });

  it('should reject upper and lower point arrays with different lengths', () => {
    const upperPoints = [
      new Vector2(0, 10),
      new Vector2(1, 10),
    ];

    const lowerPoints = [
      new Vector2(0, -10),
    ];

    expect(() => new TriangleStrip(upperPoints, lowerPoints).create()).toThrow(
      'TriangleStrip upper and lower points must have the same point count.',
    );
  });

  it('should reject non-aligned x values', () => {
    const upperPoints = [
      new Vector2(0, 10),
      new Vector2(1, 10),
    ];

    const lowerPoints = [
      new Vector2(0, -10),
      new Vector2(2, -10),
    ];

    expect(() => new TriangleStrip(upperPoints, lowerPoints).create()).toThrow(
      'TriangleStrip upper and lower x values must match at index 1.',
    );
  });
});
