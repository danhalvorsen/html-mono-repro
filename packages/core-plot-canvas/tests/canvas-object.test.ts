import { describe, expect, it } from "vitest";
import { svg } from "lit";

import { CanvasObject, type HitTestContext } from "../src/canvas-object.js";
import type { RenderContext } from "../src/render-context.js";

class TestCanvasObject extends CanvasObject {
  private readonly minX: number;
  private readonly minY: number;
  private readonly maxX: number;
  private readonly maxY: number;

  public constructor(id?: string, minX = 0, minY = 0, maxX = 20, maxY = 20) {
    super(id);
    this.minX = minX;
    this.minY = minY;
    this.maxX = maxX;
    this.maxY = maxY;
  }

  public override render(_context: RenderContext) {
    return svg`<g data-test-object=${this.id}></g>`;
  }

  public override hitTest(context: HitTestContext): boolean {
    return (
      context.x >= this.minX &&
      context.x <= this.maxX &&
      context.y >= this.minY &&
      context.y <= this.maxY
    );
  }
}

describe("CanvasObject", () => {
  it("should keep explicit ids stable", () => {
    const object = new TestCanvasObject("stable-id");

    expect(object.id).toBe("stable-id");
    expect(object.id).toBe("stable-id");
  });

  it("should generate stable implicit ids", () => {
    const object = new TestCanvasObject();

    expect(object.id.startsWith("canvas-object-")).toBe(true);
    expect(object.id).toBe(object.id);
  });

  it("should default to no interaction capabilities", () => {
    const object = new TestCanvasObject("plain");

    expect(object.getCapabilities()).toEqual({});
  });

  it("should default to no bounds", () => {
    const object = new TestCanvasObject("plain");

    expect(
      object.getBounds({
        width: 100,
        height: 100,
        selectedObjectId: null,
        selectedPointId: null,
      }),
    ).toBeNull();
  });
});
