// packages/NewShapeThreeJS/Shape/core-shapes-abstract/tests/IDrawableShape.test.ts

import { describe, expect, test } from "vitest";
import type { IDrawableShape } from "../src/IDrawableShape.js";
import type { ShapeId } from "../src/ShapeId.js";
import type { ShapeType } from "../src/ShapeType.js";

interface FakeContext {
  calls: string[];
}

describe("IDrawableShape contract", () => {
  test("should call draw with provided context", () => {
    const shape: IDrawableShape<FakeContext> = {
      id: "shape-1" as ShapeId,
      type: "drawable" as ShapeType,
      draw(ctx: FakeContext): void {
        ctx.calls.push("draw");
      },
    };

    const context: FakeContext = { calls: [] };

    shape.draw(context);

    expect(context.calls).toEqual(["draw"]);
  });
});