// tests/fixtures/RectGeometryFixture.ts

import { RectGeometryService } from "../../src/RectGeometryService.js";
import { RectPlacementSolver } from "../../src/RectPlacementSolver.js";
import { ThreeRectGeometryFactory } from "../../src/ThreeRectGeometryFactory.js";
import type { IRectState } from "../../src/IRectState.js";
import { RectSemantic } from "../../src/RectSemantic.js";

export class RectGeometryFixture {
  public readonly geometryService: RectGeometryService;
  public readonly placementSolver: RectPlacementSolver;
  public readonly geometryFactory: ThreeRectGeometryFactory;

  public constructor() {
    this.geometryService = new RectGeometryService();
    this.placementSolver = new RectPlacementSolver(this.geometryService);
    this.geometryFactory = new ThreeRectGeometryFactory(this.geometryService);
  }

  public createAxisAlignedRect(): IRectState {
    return Object.freeze({
      centerX: 2,
      centerY: 2,
      centerZ: 0,
      size: Object.freeze({
        width: 2,
        height: 2,
        depth: 1,
      }),
      rotationDegrees: 0,
      mode: "EdgeLocked",
      pivot: RectSemantic.Top.Right,
    });
  }

  public createRotatedRect(): IRectState {
    return Object.freeze({
      centerX: 3,
      centerY: 1,
      centerZ: 0,
      size: Object.freeze({
        width: 2,
        height: 2,
        depth: 1,
      }),
      rotationDegrees: 90,
      mode: "EdgeLocked",
      pivot: RectSemantic.Top.Right,
    });
  }
}