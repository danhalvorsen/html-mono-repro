import type { Point, Point2 } from '@monorepo/core-math';
import {
  Polygon,
  SvgPolygon,
  type SvgShapeStyle,
} from '@monorepo/game-assets-shapes';
import { html, type TemplateResult } from 'lit';
import './GamePolygon.js';

export type PointMapper = (point: Readonly<Point>) => Point;

export interface SvgRectangleBuilderStyle {
  readonly fill: string;
  readonly stroke: string;
  readonly strokeWidth: number;
}

export class SvgRectangleBuilder {
  readonly #length: number;
  readonly #height: number;
  readonly #center: Point2;
  readonly #canvasWidth: number;
  readonly #canvasHeight: number;
  readonly #coordinateMapper: PointMapper | null;
  readonly #style: SvgRectangleBuilderStyle;

  public constructor(options: {
    readonly length?: number;
    readonly height?: number;
    readonly center?: Point2;
    readonly canvasWidth?: number;
    readonly canvasHeight?: number;
    readonly coordinateMapper?: PointMapper | null;
    readonly style?: SvgRectangleBuilderStyle;
  } = {}) {
    this.#length = options.length ?? 16;
    this.#height = options.height ?? options.length ?? 16;
    this.#center = options.center ?? { x: 0, y: 0 };
    this.#canvasWidth = options.canvasWidth ?? 1500;
    this.#canvasHeight = options.canvasHeight ?? 300;
    this.#coordinateMapper = options.coordinateMapper ?? null;
    this.#style = options.style ?? {
      fill: '#60a5fa',
      stroke: '#1d4ed8',
      strokeWidth: 2,
    };
  }

  public withLength(length: number): SvgRectangleBuilder {
    return new SvgRectangleBuilder({
      length,
      height: this.#height,
      center: this.#center,
      canvasWidth: this.#canvasWidth,
      canvasHeight: this.#canvasHeight,
      coordinateMapper: this.#coordinateMapper,
      style: this.#style,
    });
  }

  public withHeigth(height: number): SvgRectangleBuilder {
    return this.withHeight(height);
  }

  public withHeight(height: number): SvgRectangleBuilder {
    return new SvgRectangleBuilder({
      length: this.#length,
      height,
      center: this.#center,
      canvasWidth: this.#canvasWidth,
      canvasHeight: this.#canvasHeight,
      coordinateMapper: this.#coordinateMapper,
      style: this.#style,
    });
  }

  public withCenter(center: Point2): SvgRectangleBuilder {
    return new SvgRectangleBuilder({
      length: this.#length,
      height: this.#height,
      center,
      canvasWidth: this.#canvasWidth,
      canvasHeight: this.#canvasHeight,
      coordinateMapper: this.#coordinateMapper,
      style: this.#style,
    });
  }

  public withCanvasSize(width: number, height: number): SvgRectangleBuilder {
    return new SvgRectangleBuilder({
      length: this.#length,
      height: this.#height,
      center: this.#center,
      canvasWidth: width,
      canvasHeight: height,
      coordinateMapper: this.#coordinateMapper,
      style: this.#style,
    });
  }

  public withCoordinateMapper(mapper: PointMapper): SvgRectangleBuilder {
    return new SvgRectangleBuilder({
      length: this.#length,
      height: this.#height,
      center: this.#center,
      canvasWidth: this.#canvasWidth,
      canvasHeight: this.#canvasHeight,
      coordinateMapper: mapper,
      style: this.#style,
    });
  }

  public withStyle(style: SvgRectangleBuilderStyle): SvgRectangleBuilder {
    return new SvgRectangleBuilder({
      length: this.#length,
      height: this.#height,
      center: this.#center,
      canvasWidth: this.#canvasWidth,
      canvasHeight: this.#canvasHeight,
      coordinateMapper: this.#coordinateMapper,
      style,
    });
  }

  public build(): TemplateResult {
    const halfLength = this.#length / 2;
    const halfHeight = this.#height / 2;

    const points: Point[] = [
      { x: this.#center.x - halfLength, y: this.#center.y - halfHeight },
      { x: this.#center.x + halfLength, y: this.#center.y - halfHeight },
      { x: this.#center.x + halfLength, y: this.#center.y + halfHeight },
      { x: this.#center.x - halfLength, y: this.#center.y + halfHeight },
    ];

    const mappedPoints = this.#coordinateMapper
      ? points.map(point => this.#coordinateMapper!(point))
      : points;

    const polygon = new SvgPolygon(
      new Polygon(mappedPoints),
      this.#style satisfies SvgShapeStyle,
    );

    return html`
      <game-polygon
        .width=${this.#canvasWidth}
        .height=${this.#canvasHeight}
        .polygon=${polygon}
      ></game-polygon>
    `;
  }
}
