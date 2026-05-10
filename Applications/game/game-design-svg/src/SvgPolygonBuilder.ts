import type { Point, Point2 } from '@monorepo/core-math';
import {
  Polygon,
  SvgOpenPolygon,
  SvgPolygon,
  type ISvgTemplate,
  type SvgShapeStyle,
} from '@monorepo/game-assets-shapes';

export type PointMapper = (point: Readonly<Point>) => Point;

export interface GamePolygon {
  readonly width: number;
  readonly height: number;
  readonly polygon: ISvgTemplate;
}

export interface SvgPolygonBuilderOptions {
  readonly width?: number;
  readonly height?: number;
  readonly coordinateMapper?: PointMapper;
  readonly closed?: boolean;
  readonly style?: SvgShapeStyle;
}

export class SvgPolygonBuilder {
  private readonly points: readonly Point[];
  private readonly options: SvgPolygonBuilderOptions;

  public constructor(
    points: readonly Point[],
    options: SvgPolygonBuilderOptions = {},
  ) {
    this.points = Object.freeze([...points]);
    this.options = options;
  }

  public build(): GamePolygon {
    const mappedPoints = this.mapPoints(this.points);
    const polygon = new Polygon(mappedPoints);
    const template = this.options.closed === false
      ? new SvgOpenPolygon(polygon, this.options.style)
      : new SvgPolygon(polygon, this.options.style);

    return {
      width: this.options.width ?? 300,
      height: this.options.height ?? 150,
      polygon: template,
    };
  }

  private mapPoints(points: readonly Point[]): readonly Point[] {
    const mapper = this.options.coordinateMapper;

    if (!mapper) {
      return points.map(point => ({ x: point.x, y: point.y }));
    }

    return points.map(point => mapper(point));
  }
}

export interface SvgRectangleBuilderOptions {
  readonly x?: number;
  readonly y?: number;
  readonly center?: Point2;
  readonly length?: number;
  readonly height?: number;
  readonly width?: number;
  readonly canvasWidth?: number;
  readonly canvasHeight?: number;
  readonly coordinateMapper?: PointMapper;
  readonly style?: SvgShapeStyle;
}

type ResolvedSvgRectangleBuilderOptions = Readonly<{
  x: number;
  y: number;
  center: Point2 | null;
  length: number;
  height: number;
  width: number;
  canvasWidth: number;
  canvasHeight: number;
  coordinateMapper?: PointMapper;
  style?: SvgShapeStyle;
}>;

export class SvgRectangleBuilder {
  private readonly options: ResolvedSvgRectangleBuilderOptions;

  public constructor(options: SvgRectangleBuilderOptions = {}) {
    this.options = {
      x: options.x ?? 0,
      y: options.y ?? 0,
      center: options.center ?? null,
      length: options.length ?? 10,
      height: options.height ?? options.length ?? 10,
      width: options.width ?? 300,
      canvasWidth: options.canvasWidth ?? options.width ?? 300,
      canvasHeight: options.canvasHeight ?? 150,
      coordinateMapper: options.coordinateMapper,
      style: options.style,
    };
  }

  public withX(x: number): SvgRectangleBuilder {
    return this.copy({
      x,
      center: undefined,
    });
  }

  public withY(y: number): SvgRectangleBuilder {
    return this.copy({
      y,
      center: undefined,
    });
  }

  public withCenter(center: Point2): SvgRectangleBuilder {
    return this.copy({
      center,
    });
  }

  public withLength(length: number): SvgRectangleBuilder {
    return this.copy({ length });
  }

  public withHeigth(height: number): SvgRectangleBuilder {
    return this.withHeight(height);
  }

  public withHeight(height: number): SvgRectangleBuilder {
    return this.copy({ height });
  }

  public withCanvasSize(width: number, height: number): SvgRectangleBuilder {
    return this.copy({
      canvasWidth: width,
      canvasHeight: height,
      width,
    });
  }

  public withCoordinateMapper(coordinateMapper: PointMapper): SvgRectangleBuilder {
    return this.copy({ coordinateMapper });
  }

  public withStyle(style: SvgShapeStyle): SvgRectangleBuilder {
    return this.copy({ style });
  }

  public build(): GamePolygon {
    const topLeft = this.resolveTopLeft();

    const points: readonly Point[] = [
      { x: topLeft.x, y: topLeft.y },
      { x: topLeft.x + this.options.length, y: topLeft.y },
      {
        x: topLeft.x + this.options.length,
        y: topLeft.y + this.options.height,
      },
      { x: topLeft.x, y: topLeft.y + this.options.height },
    ];

    return new SvgPolygonBuilder(points, {
      width: this.options.canvasWidth,
      height: this.options.canvasHeight,
      coordinateMapper: this.options.coordinateMapper,
      style: this.options.style,
      closed: true,
    }).build();
  }

  private resolveTopLeft(): Point2 {
    if (!this.options.center) {
      return {
        x: this.options.x,
        y: this.options.y,
      };
    }

    return {
      x: this.options.center.x - this.options.length / 2,
      y: this.options.center.y - this.options.height / 2,
    };
  }

  private copy(overrides: SvgRectangleBuilderOptions): SvgRectangleBuilder {
    const nextCenter =
      Object.prototype.hasOwnProperty.call(overrides, 'center')
        ? overrides.center ?? null
        : this.options.center;

    return new SvgRectangleBuilder({
      x: overrides.x ?? this.options.x,
      y: overrides.y ?? this.options.y,
      center: nextCenter ?? undefined,
      length: overrides.length ?? this.options.length,
      height: overrides.height ?? this.options.height,
      width: overrides.width ?? this.options.width,
      canvasWidth: overrides.canvasWidth ?? this.options.canvasWidth,
      canvasHeight: overrides.canvasHeight ?? this.options.canvasHeight,
      coordinateMapper: overrides.coordinateMapper ?? this.options.coordinateMapper,
      style: overrides.style ?? this.options.style,
    });
  }
}
