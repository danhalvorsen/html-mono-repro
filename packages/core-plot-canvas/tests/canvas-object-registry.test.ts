import { describe, expect, it } from "vitest";
import { svg } from "lit";

import { CanvasObject } from "../src/canvas-object.js";
import { CanvasObjectRegistry } from "../src/canvas-object-registry.js";
import type { RenderContext } from "../src/render-context.js";

class TestCanvasObject extends CanvasObject {
  private readonly minX: number;
  private readonly minY: number;
  private readonly maxX: number;
  private readonly maxY: number;

  public constructor(id: string, minX = 0, minY = 0, maxX = 20, maxY = 20) {
    super(id);
    this.minX = minX;
    this.minY = minY;
    this.maxX = maxX;
    this.maxY = maxY;
  }

  public override render(_context: RenderContext) {
    return svg`<g data-test-object=${this.id}></g>`;
  }

  public override hitTest(context: { x: number; y: number }): boolean {
    return (
      context.x >= this.minX &&
      context.x <= this.maxX &&
      context.y >= this.minY &&
      context.y <= this.maxY
    );
  }
}

describe("CanvasObjectRegistry", () => {
  it("should preserve deterministic registration order", () => {
    const registry = new CanvasObjectRegistry();
    registry.register(new TestCanvasObject("lower"));
    registry.register(new TestCanvasObject("upper"));

    expect(registry.getAll().map((object) => object.id)).toEqual(["lower", "upper"]);
  });

  it("should return all matching hit objects", () => {
    const registry = new CanvasObjectRegistry();
    registry.register(new TestCanvasObject("lower", 0, 0, 40, 40));
    registry.register(new TestCanvasObject("upper", 10, 10, 50, 50));

    expect(registry.hitTest({ x: 20, y: 20 }).map((object) => object.id)).toEqual([
      "lower",
      "upper",
    ]);
  });

  it("should return the top-most hit object", () => {
    const registry = new CanvasObjectRegistry();
    registry.register(new TestCanvasObject("lower", 0, 0, 40, 40));
    registry.register(new TestCanvasObject("upper", 10, 10, 50, 50));

    expect(registry.hitTestTopMost({ x: 20, y: 20 })?.id).toBe("upper");
  });

  it("should reject duplicate canvas object ids", () => {
    const registry = new CanvasObjectRegistry();
    registry.register(new TestCanvasObject("duplicate"));

    expect(() => registry.register(new TestCanvasObject("duplicate"))).toThrow(
      "Duplicate CanvasObject id: duplicate",
    );
  });

  it("should return null when no object is hit", () => {
    const registry = new CanvasObjectRegistry();
    registry.register(new TestCanvasObject("only", 0, 0, 20, 20));

    expect(registry.hitTestTopMost({ x: 100, y: 100 })).toBeNull();
  });
});
