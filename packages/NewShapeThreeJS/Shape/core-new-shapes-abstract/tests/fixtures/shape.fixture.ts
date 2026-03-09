// packages/NewShapeThreeJS/Shape/core-shapes-abstract/tests/fixtures/shape.fixture.ts

import { expect, test as base } from "vitest";
import type { IShape } from "../../src/IShape.js";
import type { ShapeId } from "../../src/ShapeId.js";
import type { ShapeType } from "../../src/ShapeType.js";

interface ShapeFixtureContext {
  createShape(id?: string, type?: string): IShape;
}

function toShapeId(value: string): ShapeId {
  return value as ShapeId;
}

function toShapeType(value: string): ShapeType {
  return value as ShapeType;
}

export const test = base.extend<ShapeFixtureContext>({
  createShape: async ({}, use) => {
    const factory = (id = "shape-1", type = "generic"): IShape => ({
      id: toShapeId(id),
      type: toShapeType(type),
    });

    await use(factory);
  },
});

export { expect };