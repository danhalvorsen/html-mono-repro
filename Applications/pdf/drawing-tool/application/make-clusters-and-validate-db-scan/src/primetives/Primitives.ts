export type PrimitivePoint = Readonly<{
  x: number;
  y: number;
}>;

export type PolygonPrimitive = Readonly<{
  kind: "polygon";
  points: ReadonlyArray<PrimitivePoint>;
  fill: string;
  stroke: string;
  strokeWidth: number;
}>;

export type CirclePrimitive = Readonly<{
  kind: "circle";
  cx: number;
  cy: number;
  radius: number;
  fill: string;
  stroke: string;
  strokeWidth: number;
}>;

export type LinePrimitive = Readonly<{
  kind: "line";
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  stroke: string;
  strokeWidth: number;
}>;

export type RectanglePrimitive = Readonly<{
  kind: "rectangle";
  x: number;
  y: number;
  width: number;
  height: number;
  fill: string;
  stroke: string;
  strokeWidth: number;
}>;

export type CanvasPrimitive =
  | PolygonPrimitive
  | CirclePrimitive
  | LinePrimitive
  | RectanglePrimitive;

export class Primitives {
  private constructor() {}

  public static point(x: number, y: number): PrimitivePoint {
    this.ensureFiniteNumber(x, "x");
    this.ensureFiniteNumber(y, "y");

    return { x, y };
  }

  public static parsePoints(value: string | null): ReadonlyArray<PrimitivePoint> {
    if (value === null || value.trim().length === 0) {
      return [];
    }

    return value
      .trim()
      .split(/\s+/)
      .map((pair) => pair.split(","))
      .filter((pair) => pair.length === 2)
      .map(([x, y]) => [Number(x.trim()), Number(y.trim())] as const)
      .filter(([x, y]) => Number.isFinite(x) && Number.isFinite(y))
      .map(([x, y]) => this.point(x, y));
  }

  public static polygon(
    points: ReadonlyArray<PrimitivePoint>,
    fill: string = "transparent",
    stroke: string = "#111827",
    strokeWidth: number = 1
  ): PolygonPrimitive {
    this.ensurePoints(points);
    this.ensureBrush(fill, "fill");
    this.ensureBrush(stroke, "stroke");
    this.ensureNonNegativeNumber(strokeWidth, "strokeWidth");

    return {
      kind: "polygon",
      points: [...points],
      fill,
      stroke,
      strokeWidth
    };
  }

  public static circle(
    cx: number,
    cy: number,
    radius: number,
    fill: string = "transparent",
    stroke: string = "#111827",
    strokeWidth: number = 1
  ): CirclePrimitive {
    this.ensureFiniteNumber(cx, "cx");
    this.ensureFiniteNumber(cy, "cy");
    this.ensurePositiveNumber(radius, "radius");
    this.ensureBrush(fill, "fill");
    this.ensureBrush(stroke, "stroke");
    this.ensureNonNegativeNumber(strokeWidth, "strokeWidth");

    return {
      kind: "circle",
      cx,
      cy,
      radius,
      fill,
      stroke,
      strokeWidth
    };
  }

  public static line(
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    stroke: string = "#111827",
    strokeWidth: number = 1
  ): LinePrimitive {
    this.ensureFiniteNumber(x1, "x1");
    this.ensureFiniteNumber(y1, "y1");
    this.ensureFiniteNumber(x2, "x2");
    this.ensureFiniteNumber(y2, "y2");
    this.ensureBrush(stroke, "stroke");
    this.ensureNonNegativeNumber(strokeWidth, "strokeWidth");

    return {
      kind: "line",
      x1,
      y1,
      x2,
      y2,
      stroke,
      strokeWidth
    };
  }

  public static rectangle(
    x: number,
    y: number,
    width: number,
    height: number,
    fill: string = "transparent",
    stroke: string = "#111827",
    strokeWidth: number = 1
  ): RectanglePrimitive {
    this.ensureFiniteNumber(x, "x");
    this.ensureFiniteNumber(y, "y");
    this.ensurePositiveNumber(width, "width");
    this.ensurePositiveNumber(height, "height");
    this.ensureBrush(fill, "fill");
    this.ensureBrush(stroke, "stroke");
    this.ensureNonNegativeNumber(strokeWidth, "strokeWidth");

    return {
      kind: "rectangle",
      x,
      y,
      width,
      height,
      fill,
      stroke,
      strokeWidth
    };
  }

  private static ensurePoints(points: ReadonlyArray<PrimitivePoint>): void {
    if (!Array.isArray(points)) {
      throw new Error("points must be an array.");
    }

    for (const point of points) {
      this.ensureFiniteNumber(point.x, "points[].x");
      this.ensureFiniteNumber(point.y, "points[].y");
    }
  }

  private static ensureBrush(value: string, name: string): void {
    if (value.trim().length === 0) {
      throw new Error(`${name} must not be empty.`);
    }
  }

  private static ensureFiniteNumber(value: number, name: string): void {
    if (!Number.isFinite(value)) {
      throw new Error(`${name} must be a finite number.`);
    }
  }

  private static ensurePositiveNumber(value: number, name: string): void {
    if (!Number.isFinite(value) || value <= 0) {
      throw new Error(`${name} must be greater than zero.`);
    }
  }

  private static ensureNonNegativeNumber(value: number, name: string): void {
    if (!Number.isFinite(value) || value < 0) {
      throw new Error(`${name} must be greater than or equal to zero.`);
    }
  }
}