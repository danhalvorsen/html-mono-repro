import type {
  TurtlePrimitive,
  Vector3,
} from "@monorepo/game-turtle-abstract";
import type { ISvgMapperPipeline } from "@monorepo/game-turtle-svg";

export type CenteredSvgMapperOptions = {
  readonly width: number;
  readonly height: number;
};

/**
 * App-level mapper pipeline adapter.
 *
 * It maps turtle Cartesian coordinates into SVG viewport coordinates:
 * - turtle +X -> SVG +X
 * - turtle +Y -> SVG -Y
 * - origin -> center of the viewport
 *
 * Coordinate-system abstractions still belong in game-coordinate-system-and-mappers.
 */
export class CenteredSvgMapperPipeline implements ISvgMapperPipeline {
  public constructor(private readonly options: CenteredSvgMapperOptions) {}

  public mapPrimitive<TPrimitive extends TurtlePrimitive>(
    primitive: TPrimitive,
  ): TPrimitive {
    switch (primitive.kind) {
      case "line":
        return {
          ...primitive,
          from: this.mapVector(primitive.from),
          to: this.mapVector(primitive.to),
        } as TPrimitive;

      case "polyline":
      case "polygon":
        return {
          ...primitive,
          points: primitive.points.map((point) => this.mapVector(point)),
        } as TPrimitive;

      case "circle":
        return {
          ...primitive,
          center: this.mapVector(primitive.center),
        } as TPrimitive;

      default:
        return primitive;
    }
  }

  private mapVector(vector: Vector3): Vector3 {
    return {
      x: this.options.width / 2 + vector.x,
      y: this.options.height / 2 - vector.y,
      z: vector.z,
    };
  }
}