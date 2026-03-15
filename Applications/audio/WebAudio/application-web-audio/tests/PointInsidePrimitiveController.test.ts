import { describe, expect, it } from "vitest";
import { Vector2 } from "@monorepo/core-math";

import { PointInsidePrimitiveController } from "../src/lit3/Controllers/PointInsidePrimetiveController.js";

describe("PointInsidePrimitiveController", () => {
  it("should detect points near a line segment", () => {
    const controller = new PointInsidePrimitiveController();

    expect(
      controller.pointNearLineSegment(
        new Vector2(55, 53),
        new Vector2(20, 20),
        new Vector2(90, 90),
        5,
      ),
    ).toBe(true);

    expect(
      controller.pointNearLineSegment(
        new Vector2(55, 70),
        new Vector2(20, 20),
        new Vector2(90, 90),
        5,
      ),
    ).toBe(false);
  });

  it("should detect points inside a polygon", () => {
    const controller = new PointInsidePrimitiveController();
    const polygon = [
      new Vector2(20, 20),
      new Vector2(100, 30),
      new Vector2(80, 100),
      new Vector2(30, 90),
    ];

    expect(
      controller.pointInsidePolygon(new Vector2(50, 50), polygon),
    ).toBe(true);

    expect(
      controller.pointInsidePolygon(new Vector2(140, 140), polygon),
    ).toBe(false);
  });
});
