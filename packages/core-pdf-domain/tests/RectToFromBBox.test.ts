import { describe, it, expect } from "vitest";
import { Rectangle } from "../src/Rectangle.js";

/**
 * Fixtures
 */
const Fixtures = {
  rect(
    id = "r",
    x = 0,
    y = 0,
    width = 10,
    height = 10,
  ): Rectangle {
    return Rectangle.create({
      id,
      position: { x, y },
      width,
      height,
    });
  },

  minMax(
    id = "r",
    minX = 0,
    minY = 0,
    maxX = 10,
    maxY = 10,
  ) {
    return {
      id,
      min: { x: minX, y: minY },
      max: { x: maxX, y: maxY },
    } as const;
  },
};

/**
 * Tests
 */
describe("Rectangle ↔ BoundingBox", () => {
  it("creates Rectangle from min/max (bounding box shape)", () => {
    const bb = Fixtures.minMax("b1", 10, 20, 30, 50);

    const rect = Rectangle.fromMinMax({
      id: bb.id,
      min: bb.min,
      max: bb.max,
    });

    expect(rect.left).toBe(10);
    expect(rect.top).toBe(20);
    expect(rect.right).toBe(30);
    expect(rect.bottom).toBe(50);
    expect(rect.width).toBe(20);
    expect(rect.height).toBe(30);
  });

  it("normalizes inverted min/max", () => {
    const bb = Fixtures.minMax("b1", 30, 50, 10, 20);

    const rect = Rectangle.fromMinMax({
      id: bb.id,
      min: bb.min,
      max: bb.max,
    });

    expect(rect.left).toBe(10);
    expect(rect.top).toBe(20);
    expect(rect.right).toBe(30);
    expect(rect.bottom).toBe(50);
  });

  it("exports to bounding box shape", () => {
    const rect = Fixtures.rect("r1", 5, 7, 20, 30);

    const bb = rect.toBoundingBox();

    expect(bb.position.x).toBe(5);
    expect(bb.position.y).toBe(7);
    expect(bb.width).toBe(20);
    expect(bb.height).toBe(30);
  });

  it("round-trip: min/max → Rectangle → bounding box", () => {
    const bb = Fixtures.minMax("b1", 10, 20, 40, 60);

    const rect = Rectangle.fromMinMax({
      id: bb.id,
      min: bb.min,
      max: bb.max,
    });

    const result = rect.toBoundingBox();

    expect(result.position.x).toBe(10);
    expect(result.position.y).toBe(20);
    expect(result.width).toBe(30);
    expect(result.height).toBe(40);
  });

  it("round-trip: Rectangle → bounding box → Rectangle", () => {
    const original = Fixtures.rect("r1", 3, 4, 50, 60);

    const bb = original.toBoundingBox();

    const rect = Rectangle.create({
      id: original.id,
      position: bb.position,
      width: bb.width,
      height: bb.height,
    });

    expect(rect.left).toBe(original.left);
    expect(rect.top).toBe(original.top);
    expect(rect.width).toBe(original.width);
    expect(rect.height).toBe(original.height);
  });

  it("ensures non-negative invariants from min/max", () => {
    const bb = Fixtures.minMax("b1", 10, 10, 5, 5);

    const rect = Rectangle.fromMinMax({
      id: bb.id,
      min: bb.min,
      max: bb.max,
    });

    expect(rect.width).toBeGreaterThanOrEqual(0);
    expect(rect.height).toBeGreaterThanOrEqual(0);
  });
});