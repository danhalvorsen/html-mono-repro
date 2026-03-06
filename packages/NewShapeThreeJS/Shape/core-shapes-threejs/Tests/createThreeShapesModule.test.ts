import { describe, it, expect } from "vitest";
import { createThreeShapesModule, StringShapeTypeFactory, ThreeShapeFactory, UuidShapeIdentityFactory } from "../src/index.js";
import { Object3D } from "three";
describe("createThreeShapesModule", () => {
  it("creates fully wired module", () => {
    const module = createThreeShapesModule();

    expect(module.idFactory).toBeInstanceOf(UuidShapeIdentityFactory);
    expect(module.typeFactory).toBeInstanceOf(StringShapeTypeFactory);
    expect(module.shapeFactory).toBeInstanceOf(ThreeShapeFactory);
  });

  it("shapeFactory from module creates shapes", () => {
    const module = createThreeShapesModule();
    const object3D = new Object3D();

    const shape = module.shapeFactory.create("box", object3D);

    expect(shape.type).toBe("box");
    expect(shape.getObject3D()).toBe(object3D);
  });
});