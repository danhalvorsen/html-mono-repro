// ====================================================================================
// FILE: tests/ShapeSample.integration.test.ts
// FIX:
// - remove wrong imports from other packages
// - import only from this package entrypoint
// - no side-effect sample execution in test module
// ====================================================================================

import { describe, expect, it } from "vitest";
import {
  Circle,
  Rectangle,
  ShapeComposite,
  Triangle
} from "../src/index.js";
import { ShapeSampleFixture } from "./fixtures/ShapeSampleFixture.js";

describe("ShapeSample integration", () => {
  const fixture = new ShapeSampleFixture();

  it("should build the library", () => {
    const sut = fixture.createSut();
    const library = sut.getLibrary();

    expect(library.name).toBe("Library");
    expect(library.getChildren()).toHaveLength(2);
  });

  it("should find nodes in the domain tree", () => {
    const sut = fixture.createSut();

    expect(sut.findByName("Template.House")).toBeInstanceOf(ShapeComposite);
    expect(sut.findByName("Circle.Small")).toBeInstanceOf(Circle);
    expect(sut.findByName("Rectangle.Wall")).toBeInstanceOf(Rectangle);
    expect(sut.findByName("Triangle.Roof")).toBeInstanceOf(Triangle);
  });

  it("should create a new composite from the domain tree", () => {
    const sut = fixture.createSut();

    const house = sut.createCompositeFromLibrary("Template.House", "House-1");

    expect(house.name).toBe("House-1");
    expect(house.getChildren()).toHaveLength(1);
    expect(house.getChildren()[0]).toBeInstanceOf(ShapeComposite);
  });

  it("should clone independently", () => {
    const sut = fixture.createSut();

    const house1 = sut.createCompositeFromLibrary("Template.House", "House-1");
    const house2 = sut.createCompositeFromLibrary("Template.House", "House-2");

    const template1 = house1.getChildren()[0] as ShapeComposite;
    const template2 = house2.getChildren()[0] as ShapeComposite;

    template1.add(new Rectangle("Rectangle.Extension", 2, 2));

    expect(template1.getChildren()).toHaveLength(3);
    expect(template2.getChildren()).toHaveLength(2);
  });
});