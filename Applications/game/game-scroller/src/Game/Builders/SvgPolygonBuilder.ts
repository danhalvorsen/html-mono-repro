import type { Point, Point2 } from '@monorepo/core-math';
import {
  GamePolygon,
  Polygon,
  SvgPolygon,
  type SvgPolygonStyle
} from '../GamePolygon';

export interface IBuilder<TType> {
  build(): TType;
}

export type PointMapper = (point: Readonly<Point>) => Point;

export type PolygonBuilderOptions = {
  readonly width?: number;
  readonly height?: number;
  readonly style?: SvgPolygonStyle;
  readonly coordinateMapper?: PointMapper;
};

export class SvgPolygonBuilder implements IBuilder<GamePolygon> {
  readonly #points: readonly Point[];
  readonly #options: PolygonBuilderOptions;

  public constructor(points: readonly Point[], options: PolygonBuilderOptions = {}) {
    this.#points = points;
    this.#options = options;
  }

  public build(): GamePolygon {
    const element = new GamePolygon();
    element.width = this.#options.width ?? 800;
    element.height = this.#options.height ?? 600;

    const mapPoint = this.#options.coordinateMapper ?? ((point: Readonly<Point>) => ({ x: point.x, y: point.y }));
    const mappedPoints = this.#points.map(point => mapPoint(point));

    element.polygon = new SvgPolygon(new Polygon(mappedPoints), this.#options.style);
    return element;
  }
}

export class SvgRectangleBuilder implements IBuilder<GamePolygon> {
  #x = 0;
  #y = 0;
  #width = 100;
  #height = 100;
  #polygonOptions: PolygonBuilderOptions = {};

  public constructor() {}

  public withX(x: number): this {
    this.#x = x;
    return this;
  }

  public withY(y: number): this {
    this.#y = y;
    return this;
  }

  public withStyle(style: SvgPolygonStyle): this {
    this.#polygonOptions = {
      ...this.#polygonOptions,
      style
    };
    return this;
  }

  public withCanvasSize(width: number, height: number): this {
    this.#polygonOptions = {
      ...this.#polygonOptions,
      width,
      height
    };
    return this;
  }

  public withCoordinateMapper(coordinateMapper: PointMapper): this {
    this.#polygonOptions = {
      ...this.#polygonOptions,
      coordinateMapper
    };
    return this;
  }

  public withCenter(position: Point2): this {
    this.#x = position.x - this.#width / 2;
    this.#y = position.y - this.#height / 2;
    return this;
  }

  public withLength(length: number): this {
    this.#width = length;
    return this;
  }

  public withHeigth(height: number): this {
    this.#height = height;
    return this;
  }

  public build(): GamePolygon {
    const rectanglePoints: readonly Point[] = [
      { x: this.#x, y: this.#y },
      { x: this.#x + this.#width, y: this.#y },
      { x: this.#x + this.#width, y: this.#y + this.#height },
      { x: this.#x, y: this.#y + this.#height }
    ];

    return new SvgPolygonBuilder(rectanglePoints, this.#polygonOptions).build();
  }
}
