// tests/quadTree.test.ts
import { describe, expect, it } from "vitest";
import {
  QuadTreeBounds,
  QuadTreeBoundsOperations,
  QuadTreeClearResult,
  QuadTreeEnvelopeFactory,
  QuadTreeInsertResult,
  QuadTreeItemEnvelope,
  QuadTreeOptions,
  QuadTreePoint,
  QuadTreeRectangleQueryRegion,
  QuadTreeRemoveResult,
} from "../src/index.js";

describe("QuadTreeBounds", () => {
  it("should create immutable bounds", () => {
    const bounds = new QuadTreeBounds(0, 0, 10, 20);

    expect(bounds.x).toBe(0);
    expect(bounds.y).toBe(0);
    expect(bounds.width).toBe(10);
    expect(bounds.height).toBe(20);

    expect(() => {
      (bounds as { x: number }).x = 5;
    }).toThrow();
  });

  it("should throw on invalid input", () => {
    expect(() => new QuadTreeBounds(Number.NaN, 0, 1, 1)).toThrow();
    expect(() => new QuadTreeBounds(0, 0, -1, 1)).toThrow();
  });
});

describe("QuadTreePoint", () => {
  it("should create immutable point", () => {
    const point = new QuadTreePoint(1, 2);

    expect(point.x).toBe(1);
    expect(point.y).toBe(2);

    expect(() => {
      (point as { x: number }).x = 10;
    }).toThrow();
  });
});

describe("QuadTreeBoundsOperations", () => {
  it("should detect intersection", () => {
    const a = new QuadTreeBounds(0, 0, 10, 10);
    const b = new QuadTreeBounds(5, 5, 10, 10);
    const c = new QuadTreeBounds(20, 20, 5, 5);

    expect(QuadTreeBoundsOperations.intersects(a, b)).toBe(true);
    expect(QuadTreeBoundsOperations.intersects(a, c)).toBe(false);
  });

  it("should detect containment", () => {
    const outer = new QuadTreeBounds(0, 0, 10, 10);
    const inner = new QuadTreeBounds(2, 2, 2, 2);

    expect(QuadTreeBoundsOperations.contains(outer, inner)).toBe(true);
    expect(QuadTreeBoundsOperations.contains(inner, outer)).toBe(false);
  });

  it("should detect point containment", () => {
    const bounds = new QuadTreeBounds(0, 0, 10, 10);
    const inside = new QuadTreePoint(5, 5);
    const outside = new QuadTreePoint(20, 20);

    expect(QuadTreeBoundsOperations.containsPoint(bounds, inside)).toBe(true);
    expect(QuadTreeBoundsOperations.containsPoint(bounds, outside)).toBe(false);
  });

  it("should subdivide into four quadrants", () => {
    const bounds = new QuadTreeBounds(0, 0, 10, 10);

    const result = QuadTreeBoundsOperations.subdivide(bounds);

    expect(result).toHaveLength(4);

    expect(result[0].x).toBe(0);
    expect(result[0].y).toBe(0);
    expect(result[0].width).toBe(5);
    expect(result[0].height).toBe(5);

    expect(result[1].x).toBe(5);
    expect(result[1].y).toBe(0);
    expect(result[1].width).toBe(5);
    expect(result[1].height).toBe(5);

    expect(result[2].x).toBe(0);
    expect(result[2].y).toBe(5);
    expect(result[2].width).toBe(5);
    expect(result[2].height).toBe(5);

    expect(result[3].x).toBe(5);
    expect(result[3].y).toBe(5);
    expect(result[3].width).toBe(5);
    expect(result[3].height).toBe(5);
  });
});

describe("QuadTreeItemEnvelope", () => {
  it("should wrap item with bounds", () => {
    const bounds = new QuadTreeBounds(0, 0, 1, 1);
    const envelope = new QuadTreeItemEnvelope("a", bounds);

    expect(envelope.item).toBe("a");
    expect(envelope.bounds).toBe(bounds);

    expect(() => {
      (envelope as { item: string }).item = "b";
    }).toThrow();
  });
});

describe("QuadTreeOptions", () => {
  it("should create valid options", () => {
    const options = new QuadTreeOptions({
      maxDepth: 5,
      maxItemsPerNode: 4,
    });

    expect(options.maxDepth).toBe(5);
    expect(options.maxItemsPerNode).toBe(4);
  });

  it("should throw when maxDepth is negative", () => {
    expect(() => {
      new QuadTreeOptions({
        maxDepth: -1,
        maxItemsPerNode: 4,
      });
    }).toThrow();
  });

  it("should throw when maxItemsPerNode is less than one", () => {
    expect(() => {
      new QuadTreeOptions({
        maxDepth: 1,
        maxItemsPerNode: 0,
      });
    }).toThrow();
  });
});

describe("QuadTreeInsertResult", () => {
  it("should store result values", () => {
    const result = new QuadTreeInsertResult(true, "item");

    expect(result.inserted).toBe(true);
    expect(result.item).toBe("item");
    expect(result.reason).toBeUndefined();
  });
});

describe("QuadTreeRemoveResult", () => {
  it("should store result values", () => {
    const result = new QuadTreeRemoveResult(false, "item", "not found");

    expect(result.removed).toBe(false);
    expect(result.item).toBe("item");
    expect(result.reason).toBe("not found");
  });
});

describe("QuadTreeClearResult", () => {
  it("should store cleared item count", () => {
    const result = new QuadTreeClearResult(10);

    expect(result.clearedItemCount).toBe(10);
  });
});

describe("QuadTreeEnvelopeFactory", () => {
  class TestBoundsProvider {
    public getBounds(item: number): QuadTreeBounds {
      return new QuadTreeBounds(item, item, 1, 1);
    }
  }

  it("should create a single envelope", () => {
    const factory = new QuadTreeEnvelopeFactory(new TestBoundsProvider());

    const envelope = factory.create(5);

    expect(envelope.item).toBe(5);
    expect(envelope.bounds.x).toBe(5);
    expect(envelope.bounds.y).toBe(5);
    expect(envelope.bounds.width).toBe(1);
    expect(envelope.bounds.height).toBe(1);
  });

  it("should create many envelopes", () => {
    const factory = new QuadTreeEnvelopeFactory(new TestBoundsProvider());

    const result = factory.createMany([1, 2, 3]);

    expect(result).toHaveLength(3);
    expect(result[0].bounds.x).toBe(1);
    expect(result[1].bounds.x).toBe(2);
    expect(result[2].bounds.x).toBe(3);
  });
});

describe("QuadTreeRectangleQueryRegion", () => {
  it("should return true for intersecting bounds", () => {
    const region = new QuadTreeRectangleQueryRegion(
      new QuadTreeBounds(0, 0, 10, 10),
    );

    const inside = new QuadTreeBounds(5, 5, 1, 1);
    const outside = new QuadTreeBounds(20, 20, 1, 1);

    expect(region.intersects(inside)).toBe(true);
    expect(region.intersects(outside)).toBe(false);
  });
});