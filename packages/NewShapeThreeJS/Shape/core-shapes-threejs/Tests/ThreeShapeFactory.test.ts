import { describe, it, expect } from "vitest";
import { IShapeIdentityFactory, IShapeTypeFactory, ThreeShapeFactory } from "../src/Index.js";
import type { IDrawableShape, ShapeId, ShapeType } from "@monorepo/core-shapes-abstract";
import { Object3D } from "three";
class ShapeIdentityFactoryStub implements IShapeIdentityFactory {
  public createId(): ShapeId {
    return "shape-100" as ShapeId;
  }
}

class ShapeTypeFactoryStub implements IShapeTypeFactory {
  public create(value: string): ShapeType {
    return value.trim() as ShapeType;
  }
}

describe("ThreeShapeFactory", () => {
  it("creates shape with id, type and object3D from dependencies", () => {
    const object3D = new Object3D();
    const sut = new ThreeShapeFactory(
      new ShapeIdentityFactoryStub(),
      new ShapeTypeFactoryStub()
    );

    const shape = sut.create(" box ", object3D);

    expect(shape.id).toBe("shape-100");
    expect(shape.type).toBe("box");
    expect(shape.getObject3D()).toBe(object3D);
  });
});