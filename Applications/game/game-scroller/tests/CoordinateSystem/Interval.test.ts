import { describe, expect, it } from 'vitest';
import { Interval } from '../../src/Game/CoordinateSystem/Interval.js';

describe('Interval', () => {
  it('initializes min and max', () => {
    const interval = new Interval(1, 10);
    expect(interval.min).toBe(1);
    expect(interval.max).toBe(10);
  });

  it('updates values with setMin and setMax', () => {
    const interval = new Interval(0, 0);
    interval.setMin(-5);
    interval.setMax(42);

    expect(interval.min).toBe(-5);
    expect(interval.max).toBe(42);
  });

  it('updates both values with setInterval', () => {
    const interval = new Interval(0, 1);
    interval.setInterval(new Interval(7, 9));

    expect(interval.min).toBe(7);
    expect(interval.max).toBe(9);
  });
});
