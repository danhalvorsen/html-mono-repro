import { EdgePointAddressKeys, ShapeEdgePoint } from "./types.js";
import { IEdgePointFactory } from "./IEdgePointFactory.js";
import { ShapeEdgePointAddress } from "./ShapeEdgePointAddress.js";
import type {IPoint2D } from "@monorepo/core-semantic-model";

export class ShapeEdgePointFactory implements IEdgePointFactory {
  public createPoints(start: IPoint2D, end: IPoint2D): readonly ShapeEdgePoint[] {
    return Object.freeze<readonly ShapeEdgePoint[]>([
      Object.freeze({
        address: new ShapeEdgePointAddress(EdgePointAddressKeys.Start),
        t: 0,
        position: Object.freeze({ x: start.x, y: start.y }),
      }),
      Object.freeze({
        address: new ShapeEdgePointAddress(EdgePointAddressKeys.Midpoint),
        t: 0.5,
        position: Object.freeze({
          x: (start.x + end.x) / 2,
          y: (start.y + end.y) / 2,
        }),
      }),
      Object.freeze({
        address: new ShapeEdgePointAddress(EdgePointAddressKeys.End),
        t: 1,
        position: Object.freeze({ x: end.x, y: end.y }),
      }),
    ]);
  }
}
