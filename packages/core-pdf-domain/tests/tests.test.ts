import { describe, it, expect } from "vitest";
import { Rectangle } from "../src/core/Rectangle.js";

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

  rectMinMax(
    id = "r",
    minX = 0,
    minY = 0,
    maxX = 10,
    maxY = 10,
  ): Rectangle {
    return Rectangle.fromMinMax({
      id,
      min: { x: minX, y: minY },
      max: { x: maxX, y: maxY },
    });
  },

  overlappingPair() {
    const a = this.rect("a", 0, 0, 10, 10);
    const b = this.rect("b", 5, 5, 10, 10);
    return { a, b };
  },

  nonOverlappingPair() {
    const a = this.rect("a", 0, 0, 10, 10);
    const b = this.rect("b", 20, 20, 5, 5);
    return { a, b };
  },
};

/**
 * Tests
 */
describe("Rectangle", () => {
  it("creates from position + size", () => {
    const rect = Fixtures.rect("r1", 10, 20, 30, 40);

    expect(rect.left).toBe(10);
    expect(rect.top).toBe(20);
    expect(rect.right).toBe(40);
    expect(rect.bottom).toBe(60);
    expect(rect.area).toBe(1200);
  });

  it("throws when width/height is negative", () => {
    expect(() => Fixtures.rect("r1", 0, 0, -10, -5)).toThrow(
      "Rectangle.width must be non-negative.",
    );
  });

  it("creates from min/max and normalizes", () => {
    const rect = Fixtures.rectMinMax("r1", 20, 30, 10, 10);

    expect(rect.left).toBe(10);
    expect(rect.top).toBe(10);
    expect(rect.right).toBe(20);
    expect(rect.bottom).toBe(30);
  });

  it("computes center and aspect ratio", () => {
    const rect = Fixtures.rect("r1", 0, 0, 20, 10);

    expect(rect.center.x).toBe(10);
    expect(rect.center.y).toBe(5);
    expect(rect.aspectRatio).toBe(2);
  });

  it("handles zero height aspect ratio", () => {
    const rect = Fixtures.rect("r1", 0, 0, 10, 0);

    expect(rect.aspectRatio).toBe(0);
  });

  it("contains points (inside, edge, outside)", () => {
    const rect = Fixtures.rect("r1", 0, 0, 10, 10);

    expect(rect.contains({ x: 5, y: 5 })).toBe(true);
    expect(rect.contains({ x: 10, y: 10 })).toBe(true);
    expect(rect.contains({ x: 11, y: 5 })).toBe(false);
  });

  it("detects intersection", () => {
    const { a, b } = Fixtures.overlappingPair();
    expect(a.intersects(b)).toBe(true);
  });

  it("detects no intersection", () => {
    const { a, b } = Fixtures.nonOverlappingPair();
    expect(a.intersects(b)).toBe(false);
  });

  it("computes intersection rectangle", () => {
    const { a, b } = Fixtures.overlappingPair();

    const result = a.intersection("i", b);

    expect(result).not.toBeNull();
    expect(result!.left).toBe(5);
    expect(result!.top).toBe(5);
    expect(result!.right).toBe(10);
    expect(result!.bottom).toBe(10);
  });

  it("returns null for non-overlapping intersection", () => {
    const { a, b } = Fixtures.nonOverlappingPair();
    expect(a.intersection("i", b)).toBeNull();
  });

  it("unions multiple rectangles", () => {
    const a = Fixtures.rect("a", 0, 0, 10, 10);
    const b = Fixtures.rect("b", 20, 20, 5, 5);

    const union = Rectangle.union("u", [a, b]);

    expect(union.left).toBe(0);
    expect(union.top).toBe(0);
    expect(union.right).toBe(25);
    expect(union.bottom).toBe(25);
  });

  it("translates rectangle", () => {
    const rect = Fixtures.rect("r", 0, 0, 10, 10);

    const moved = rect.translate(5, 7);

    expect(moved.left).toBe(5);
    expect(moved.top).toBe(7);
  });

  it("scales rectangle", () => {
    const rect = Fixtures.rect("r", 1, 2, 10, 20);

    const scaled = rect.scale(2);

    expect(scaled.left).toBe(2);
    expect(scaled.top).toBe(4);
    expect(scaled.width).toBe(20);
    expect(scaled.height).toBe(40);
  });

  it("inflates rectangle", () => {
    const rect = Fixtures.rect("r", 10, 10, 10, 10);

    const inflated = rect.inflate(5, 5);

    expect(inflated.left).toBe(5);
    expect(inflated.top).toBe(5);
    expect(inflated.width).toBe(20);
    expect(inflated.height).toBe(20);
  });

  it("rounds values", () => {
    const rect = Fixtures.rect("r", 1.123, 2.456, 3.789, 4.321);

    const rounded = rect.round(2);

    expect(rounded.left).toBe(1.12);
    expect(rounded.top).toBe(2.46);
    expect(rounded.width).toBe(3.79);
    expect(rounded.height).toBe(4.32);
  });
});
