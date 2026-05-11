import {
  DefaultPrimitiveFactory,
  type PolygonPrimitive,
  type TurtleSnapshot,
  type Vector3,
} from "@monorepo/game-turtle-abstract";

export type TurtleMarkerOptions = {
  readonly length: number;
  readonly halfWidth: number;
  readonly strokeColor: string;
  readonly fillColor: string;
  readonly strokeWidth: number;
};

export interface ITurtleMarkerFactory {
  createMarker(snapshot: TurtleSnapshot, options?: Partial<TurtleMarkerOptions>): PolygonPrimitive;
}

export class TurtleMarkerFactory implements ITurtleMarkerFactory {
  private readonly primitiveFactory = new DefaultPrimitiveFactory();

  public createMarker(
    snapshot: TurtleSnapshot,
    options: Partial<TurtleMarkerOptions> = {},
  ): PolygonPrimitive {
    const resolvedOptions: TurtleMarkerOptions = {
      length: options.length ?? 18,
      halfWidth: options.halfWidth ?? 8,
      strokeColor: options.strokeColor ?? "#dc2626",
      fillColor: options.fillColor ?? "#f97316",
      strokeWidth: options.strokeWidth ?? 2,
    };

    const nose = this.add(
      snapshot.position,
      this.scale(snapshot.forward, resolvedOptions.length),
    );

    const tailCenter = this.add(
      snapshot.position,
      this.scale(snapshot.forward, -resolvedOptions.length * 0.45),
    );

    const tailLeft = this.add(
      tailCenter,
      this.scale(snapshot.left, resolvedOptions.halfWidth),
    );

    const tailRight = this.add(
      tailCenter,
      this.scale(snapshot.left, -resolvedOptions.halfWidth),
    );

    return this.primitiveFactory.createPolygon({
      points: [nose, tailLeft, tailRight],
      stroke: {
        color: resolvedOptions.strokeColor,
        width: resolvedOptions.strokeWidth,
      },
      fill: {
        color: resolvedOptions.fillColor,
      },
      metadata: {
        id: "turtle-position-marker",
        tags: ["turtle-marker"],
        layer: "overlay",
      },
    });
  }

  private add(left: Vector3, right: Vector3): Vector3 {
    return {
      x: left.x + right.x,
      y: left.y + right.y,
      z: left.z + right.z,
    };
  }

  private scale(vector: Vector3, scalar: number): Vector3 {
    return {
      x: vector.x * scalar,
      y: vector.y * scalar,
      z: vector.z * scalar,
    };
  }
}