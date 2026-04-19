import { describe, it, expect } from "vitest";
import { Rectangle } from "../src/core/Rectangle.js";

/**
 * Fixtures
 */
const Fixtures = {
  boundingBox(
    id = "b",
    minX = 0,
    minY = 0,
    maxX = 10,
    maxY = 10,
  ) {
    return {
      id,
      min: { x: minX, y: minY },
      max: { x: maxX, y: maxY },
      width: maxX - minX,
      height: maxY - minY,
    };
  },

  rectangle(
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
};

/**
 * Tests
 */
describe("BoundingBox <-> Rectangle mapping", () => {
  it("maps BoundingBox -> Rectangle (min/max)", () => {
    const bb = Fixtures.boundingBox("b1", 10, 20, 30, 50);

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

  it("maps BoundingBox -> Rectangle and preserves invariants", () => {
    const bb = Fixtures.boundingBox("b1", 30, 50, 10, 20); // inverted

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

  it("maps Rectangle -> BoundingBox", () => {
    const rect = Fixtures.rectangle("r1", 5, 7, 20, 30);

    const bb = rect.toBoundingBox();

    expect(bb.position.x).toBe(5);
    expect(bb.position.y).toBe(7);
    expect(bb.width).toBe(20);
    expect(bb.height).toBe(30);
  });

  it("round-trip BoundingBox -> Rectangle -> BoundingBox", () => {
    const original = Fixtures.boundingBox("b1", 10, 20, 40, 60);

    const rect = Rectangle.fromMinMax({
      id: original.id,
      min: original.min,
      max: original.max,
    });

    const result = rect.toBoundingBox();

    expect(result.position.x).toBe(10);
    expect(result.position.y).toBe(20);
    expect(result.width).toBe(30);
    expect(result.height).toBe(40);
  });

  it("round-trip Rectangle -> BoundingBox -> Rectangle", () => {
    const original = Fixtures.rectangle("r1", 3, 4, 50, 60);

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

  it("ensures no negative dimensions after mapping", () => {
    const bb = {
      id: "b1",
      min: { x: 10, y: 10 },
      max: { x: 5, y: 5 },
      width: -5,
      height: -5,
    };

    const rect = Rectangle.fromMinMax({
      id: bb.id,
      min: bb.min,
      max: bb.max,
    });

    expect(rect.width).toBeGreaterThanOrEqual(0);
    expect(rect.height).toBeGreaterThanOrEqual(0);
  });
});