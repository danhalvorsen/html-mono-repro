// ====================================================================================
// FILE: tests/CircleShape.test.ts
// ====================================================================================

import { Vector2 } from "@monorepo/core-math";
import { describe, expect, it } from "vitest";

import { CircleShape } from "../src/lit3/WebComponents/Shapes/CircleShape.js";

describe("CircleShape.pointInsideShape", () => {
  function createCircle(centerX = 50, centerY = 50, radius = 10): CircleShape {
    const circle = new CircleShape();
    circle.center = new Vector2(centerX, centerY);
    circle.radius = radius;
    return circle;
  }

  it("should return true for the center point", () => {
    const circle = createCircle();

    expect(circle.pointInsideShape(new Vector2(50, 50), "circle")).toBe(true);
  });

  it("should return true for a point on the circle boundary", () => {
    const circle = createCircle();

    expect(circle.pointInsideShape(new Vector2(60, 50), "circle")).toBe(true);
  });

  it("should return true for a point inside the circle", () => {
    const circle = createCircle();

    expect(circle.pointInsideShape(new Vector2(55, 55), "circle")).toBe(true);
  });

  it("should return false for a point outside the circle", () => {
    const circle = createCircle();

    expect(circle.pointInsideShape(new Vector2(80, 80), "circle")).toBe(false);
  });
});