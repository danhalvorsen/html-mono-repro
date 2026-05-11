import { InvalidPrimitiveParameterError } from "../errors/InvalidPrimitiveParameterError.js";
import type { StrokeStyle } from "../styles/StrokeStyle.js";
import type { Vector3 } from "../vectors/Vector3.js";
import type {
  CreateCirclePrimitiveOptions,
  CreateLinePrimitiveOptions,
  CreatePolygonPrimitiveOptions,
  CreatePolylinePrimitiveOptions,
} from "./CreatePrimitiveOptions.js";
import type { IPrimitiveFactory } from "./IPrimitiveFactory.js";
import { PrimitiveKind } from "./PrimitiveKind.js";
import { PrimitiveValueCopier } from "./PrimitiveValueCopier.js";
import type {
  CirclePrimitive,
  LinePrimitive,
  PolygonPrimitive,
  PolylinePrimitive,
} from "./TurtlePrimitive.js";

export class DefaultPrimitiveFactory implements IPrimitiveFactory {
  private readonly copier: PrimitiveValueCopier;

  public constructor(copier: PrimitiveValueCopier = new PrimitiveValueCopier()) {
    this.copier = copier;
  }

  public createLine(options: CreateLinePrimitiveOptions): LinePrimitive {
    this.assertVector(options.from, "from");
    this.assertVector(options.to, "to");
    this.assertStroke(options.stroke);

    return Object.freeze({
      kind: PrimitiveKind.Line,
      from: this.copier.copyVector(options.from),
      to: this.copier.copyVector(options.to),
      stroke: this.copier.copyStroke(options.stroke),
      ...(options.metadata === undefined
        ? {}
        : { metadata: this.copier.copyMetadata(options.metadata) }),
    });
  }

  public createPolyline(options: CreatePolylinePrimitiveOptions): PolylinePrimitive {
    if (options.points.length < 2) {
      throw new InvalidPrimitiveParameterError("Polyline requires at least two points.");
    }

    for (const [index, point] of options.points.entries()) {
      this.assertVector(point, `points[${index}]`);
    }

    this.assertStroke(options.stroke);

    return Object.freeze({
      kind: PrimitiveKind.Polyline,
      points: Object.freeze(options.points.map((point) => this.copier.copyVector(point))),
      stroke: this.copier.copyStroke(options.stroke),
      ...(options.metadata === undefined
        ? {}
        : { metadata: this.copier.copyMetadata(options.metadata) }),
    });
  }

  public createCircle(options: CreateCirclePrimitiveOptions): CirclePrimitive {
    this.assertVector(options.center, "center");
    this.assertVector(options.normal, "normal");

    if (!Number.isFinite(options.radius) || options.radius <= 0) {
      throw new InvalidPrimitiveParameterError("Circle radius must be greater than zero.");
    }

    if (this.length(options.normal) === 0) {
      throw new InvalidPrimitiveParameterError("Circle normal must be non-zero.");
    }

    return Object.freeze({
      kind: PrimitiveKind.Circle,
      center: this.copier.copyVector(options.center),
      radius: options.radius,
      normal: this.copier.copyVector(options.normal),
      ...(options.stroke === undefined ? {} : { stroke: this.copier.copyStroke(options.stroke) }),
      ...(options.fill === undefined ? {} : { fill: this.copier.copyFill(options.fill) }),
      ...(options.metadata === undefined
        ? {}
        : { metadata: this.copier.copyMetadata(options.metadata) }),
    });
  }

  public createPolygon(options: CreatePolygonPrimitiveOptions): PolygonPrimitive {
    if (options.points.length < 3) {
      throw new InvalidPrimitiveParameterError("Polygon requires at least three points.");
    }

    for (const [index, point] of options.points.entries()) {
      this.assertVector(point, `points[${index}]`);
    }

    return Object.freeze({
      kind: PrimitiveKind.Polygon,
      points: Object.freeze(options.points.map((point) => this.copier.copyVector(point))),
      ...(options.stroke === undefined ? {} : { stroke: this.copier.copyStroke(options.stroke) }),
      ...(options.fill === undefined ? {} : { fill: this.copier.copyFill(options.fill) }),
      ...(options.metadata === undefined
        ? {}
        : { metadata: this.copier.copyMetadata(options.metadata) }),
    });
  }

  private assertVector(vector: Vector3, name: string): void {
    if (
      !Number.isFinite(vector.x) ||
      !Number.isFinite(vector.y) ||
      !Number.isFinite(vector.z)
    ) {
      throw new InvalidPrimitiveParameterError(`${name} must be a finite Vector3.`);
    }
  }

  private assertStroke(stroke: StrokeStyle): void {
    if (!Number.isFinite(stroke.width) || stroke.width <= 0) {
      throw new InvalidPrimitiveParameterError("Stroke width must be greater than zero.");
    }
  }

  private length(vector: Vector3): number {
    return Math.sqrt(vector.x * vector.x + vector.y * vector.y + vector.z * vector.z);
  }
}