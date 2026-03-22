import { BoundingBox2D, Vector2 } from '../src/index.js';
import { describe, expect, it } from "vitest";
class BoundingBox2DContainsBoxFixture {
  public createTarget(): BoundingBox2D {
    return new BoundingBox2D(
      new Vector2(0, 0),
      new Vector2(10, 10),
    );
  }

  public createInside(): BoundingBox2D {
    return new BoundingBox2D(
      new Vector2(2, 2),
      new Vector2(5, 5),
    );
  }

  public createExact(): BoundingBox2D {
    return new BoundingBox2D(
      new Vector2(0, 0),
      new Vector2(10, 10),
    );
  }

  public createOutsideLeft(): BoundingBox2D {
    return new BoundingBox2D(
      new Vector2(-1, 2),
      new Vector2(5, 5),
    );
  }

  public createOutsideRight(): BoundingBox2D {
    return new BoundingBox2D(
      new Vector2(8, 2),
      new Vector2(12, 5),
    );
  }

  public createOutsideBottom(): BoundingBox2D {
    return new BoundingBox2D(
      new Vector2(2, -1),
      new Vector2(5, 5),
    );
  }

  public createOutsideTop(): BoundingBox2D {
    return new BoundingBox2D(
      new Vector2(2, 2),
      new Vector2(5, 12),
    );
  }

  public createIntersectingOnly(): BoundingBox2D {
    return new BoundingBox2D(
      new Vector2(8, 8),
      new Vector2(12, 12),
    );
  }

  public createLargerThanTarget(): BoundingBox2D {
    return new BoundingBox2D(
      new Vector2(-1, -1),
      new Vector2(11, 11),
    );
  }

  public createTouchingEdge(): BoundingBox2D {
    return new BoundingBox2D(
      new Vector2(0, 2),
      new Vector2(5, 5),
    );
  }
}
describe("BoundingBox2D.containsBox", () => {
  const fx = new BoundingBox2DContainsBoxFixture();

  // ==================================================================================
  // POSITIVE TESTS
  // ==================================================================================

  it("should return true when box is fully inside", () => {
    const target = fx.createTarget();
    const source = fx.createInside();

    expect(target.containsBox(source)).toBe(true);
  });

  it("should return true when box exactly matches target", () => {
    const target = fx.createTarget();
    const source = fx.createExact();

    expect(target.containsBox(source)).toBe(true);
  });

  it("should return true when box touches boundary but is inside", () => {
    const target = fx.createTarget();
    const source = fx.createTouchingEdge();

    expect(target.containsBox(source)).toBe(true);
  });

  // ==================================================================================
  // NEGATIVE TESTS
  // ==================================================================================

  it("should return false when box exceeds left boundary", () => {
    const target = fx.createTarget();
    const source = fx.createOutsideLeft();

    expect(target.containsBox(source)).toBe(false);
  });

  it("should return false when box exceeds right boundary", () => {
    const target = fx.createTarget();
    const source = fx.createOutsideRight();

    expect(target.containsBox(source)).toBe(false);
  });

  it("should return false when box exceeds bottom boundary", () => {
    const target = fx.createTarget();
    const source = fx.createOutsideBottom();

    expect(target.containsBox(source)).toBe(false);
  });

  it("should return false when box exceeds top boundary", () => {
    const target = fx.createTarget();
    const source = fx.createOutsideTop();

    expect(target.containsBox(source)).toBe(false);
  });

  it("should return false when box only intersects", () => {
    const target = fx.createTarget();
    const source = fx.createIntersectingOnly();

    expect(target.containsBox(source)).toBe(false);
  });

  it("should return false when box is larger than target", () => {
    const target = fx.createTarget();
    const source = fx.createLargerThanTarget();

    expect(target.containsBox(source)).toBe(false);
  });
});