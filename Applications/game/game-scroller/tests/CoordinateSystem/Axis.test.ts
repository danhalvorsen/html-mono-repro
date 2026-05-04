import { describe, expect, it } from 'vitest';
import { Axis } from '../../src/Game/CoordinateSystem/Axis.js';
import { Interval } from '../../src/Game/CoordinateSystem/Interval.js';

describe('Axis', () => {
  it('returns its interval via getInterval', () => {
    const interval = new Interval(2, 8);
    const axis = new Axis(interval);

    expect(axis.getInterval().min).toBe(2);
    expect(axis.getInterval().max).toBe(8);
  });

  it('updates underlying interval with setInterval', () => {
    const axis = new Axis(new Interval(0, 100));
    axis.setInterval(new Interval(-10, 10));

    expect(axis.getInterval().min).toBe(-10);
    expect(axis.getInterval().max).toBe(10);
  });
});
