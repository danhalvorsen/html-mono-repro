import { Axis, type IAxis } from './Axis';
import { Interval } from './Interval';

export interface ICoordinateSystem {
  xaxis: IAxis;
  yaxis: IAxis;
}

export interface ICartesianCoordinateSystem extends ICoordinateSystem {}

export class CartesianCoordinateSystem implements ICartesianCoordinateSystem {
  public xaxis: IAxis;
  public yaxis: IAxis;

  public constructor(coordinateSystem?: Partial<ICoordinateSystem>) {
    this.xaxis = coordinateSystem?.xaxis ?? new Axis(new Interval(0, 100));
    this.yaxis = coordinateSystem?.yaxis ?? new Axis(new Interval(0, 100));
  }
}

export interface ISvgCoordinateSystem {
  coordinateSystem: ICoordinateSystem;
}

/*
The mapper maps a source coordinate system to a target coordinate system,
for example SVG coordinates to Cartesian coordinates.
*/
export interface IMapper<TSource, TTarget> {
  map(source: TSource): TTarget;
}

export class SvgCartesianCoordinateMapper
  implements IMapper<ISvgCoordinateSystem, ICartesianCoordinateSystem> {
  public map(source: ISvgCoordinateSystem): ICartesianCoordinateSystem {
    const sourceX = source.coordinateSystem.xaxis.getInterval();
    const sourceY = source.coordinateSystem.yaxis.getInterval();

    const targetX = new Axis(new Interval(sourceX.min, sourceX.max));

    // SVG Y grows downward; Cartesian Y grows upward.
    const targetY = new Axis(new Interval(sourceY.max, sourceY.min));

    return new CartesianCoordinateSystem({
      xaxis: targetX,
      yaxis: targetY
    });
  }
}
