import { describe, expect, it } from 'vitest';
import { Axis } from '../../src/Game/CoordinateSystem/Axis.js';
import { Interval } from '../../src/Game/CoordinateSystem/Interval.js';
import {
  CartesianCoordinateSystem,
  SvgCartesianCoordinateMapper,
  type ISvgCoordinateSystem
} from '../../src/Game/CoordinateSystem/Mapper.js';

describe('Coordinate Mapper', () => {
  it('creates default Cartesian coordinate system', () => {
    const cartesian = new CartesianCoordinateSystem();

    expect(cartesian.xaxis.getInterval().min).toBe(0);
    expect(cartesian.xaxis.getInterval().max).toBe(100);
    expect(cartesian.yaxis.getInterval().min).toBe(0);
    expect(cartesian.yaxis.getInterval().max).toBe(100);
  });

  it('maps SVG axes to Cartesian axes and flips Y', () => {
    const mapper = new SvgCartesianCoordinateMapper();
    const source: ISvgCoordinateSystem = {
      coordinateSystem: {
        xaxis: new Axis(new Interval(0, 800)),
        yaxis: new Axis(new Interval(0, 600))
      }
    };

    const result = mapper.map(source);

    expect(result.xaxis.getInterval().min).toBe(0);
    expect(result.xaxis.getInterval().max).toBe(800);
    expect(result.yaxis.getInterval().min).toBe(600);
    expect(result.yaxis.getInterval().max).toBe(0);
  });
});
