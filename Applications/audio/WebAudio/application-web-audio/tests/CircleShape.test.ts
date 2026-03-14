import { Vector2 } from "@monorepo/core-math";
import { describe, expect, it } from "vitest";

import { CircleShape } from "../src/lit3/WebComponents/Shapes/CircleShape.js";

describe("CircleShape.containsPoint", () => {
  function createCircle(centerX = 50, centerY = 50, radius = 10): CircleShape {
    const circle = new CircleShape();
    circle.center = new Vector2(centerX, centerY);
    circle.radius = radius;
    return circle;
  }

  it("returns true for the center point", () => {
    const circle = createCircle();

    expect(circle.containsPoint(new Vector2(50, 50))).toBe(true);
  });

  it("returns true for a point on the bounding box boundary", () => {
    const circle = createCircle();

    expect(circle.containsPoint(new Vector2(60, 60))).toBe(true);
  });

  it("returns true for a point inside the bounding box", () => {
    const circle = createCircle();

    expect(circle.containsPoint(new Vector2(59, 59))).toBe(true);
  });

  it("returns false for a point outside the bounding box", () => {
    const circle = createCircle();

    expect(circle.containsPoint(new Vector2(80, 80))).toBe(false);
  });
});