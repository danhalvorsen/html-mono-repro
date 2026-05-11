import { Point } from "@monorepo/core-math";
import { Polygon } from "../polygon.js";
 
export type PointMapper = (point: Readonly<Point>) => Point;

export interface PolygonBuilderOptions {
  readonly coordinateMapper?: PointMapper;
  readonly closed?: boolean;
}

export class PolygonBuilder {
  readonly #points: readonly Point[];
  #options: PolygonBuilderOptions;

  public constructor(points: readonly Point[], options: PolygonBuilderOptions = {}) {
    this.#points = points;
    this.#options = options;
  }

  public withClosed(): this {
    this.#options = { ...this.#options, closed: true };
    return this;
  }

  public withOpen(): this {
    this.#options = { ...this.#options, closed: false };
    return this;
  }

  public withCoordinateMapper(mapper: PointMapper): this {
    this.#options = { ...this.#options, coordinateMapper: mapper };
    return this;
  }

  public build(): Polygon {
    const mapPoint =
      this.#options.coordinateMapper ??
      ((p: Readonly<Point>) => ({ x: p.x, y: p.y }));

    const mapped = this.#points.map(mapPoint).map(p => ({ ...p, z: 0 })) as any;

    return new Polygon(mapped, this.#options.closed ?? false);
  }
}
