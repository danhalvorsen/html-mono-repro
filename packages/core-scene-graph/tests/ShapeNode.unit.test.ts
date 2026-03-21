// packages/core-scene-graph/tests/ShapeNode.unit.test.ts

import { describe, expect, it } from "vitest";
import { SceneGraphFixture } from "./fixtures/SceneGraphFixture.js";

describe("ShapeNode", () => {
  const fixture = new SceneGraphFixture();

  it("should expose payload", () => {
    const sut = fixture.createShapeNode("shape-1", { kind: "point", value: "P1" });

    expect(sut.payload).toEqual({ kind: "point", value: "P1" });
  });

  it("should start with identity local and world matrices", () => {
    const sut = fixture.createShapeNode();

    expect(sut.local.equals(fixture.createIdentityMatrix())).toBe(true);
    expect(sut.world.equals(fixture.createIdentityMatrix())).toBe(true);
    expect(sut.getChildren()).toEqual([]);
  });

  it("should update world from parent matrix", () => {
    const sut = fixture.createShapeNode("shape-1", { kind: "point", value: "P1" });
    const parent = fixture.createTranslationMatrix(100, 200);

    sut.translate(5, 7);
    sut.updateWorld(parent);

    expect(SceneGraphFixture.readTranslationFromMatrix(sut.world)).toEqual({
      x: 105,
      y: 207,
    });
  });

  it("should support translate scale and rotate fluently", () => {
    const sut = fixture.createShapeNode();

    expect(sut.translate(1, 2)).toBe(sut);
    expect(sut.scale(2, 2)).toBe(sut);
    expect(sut.rotate(Math.PI / 3)).toBe(sut);
  });

  it("should replace local matrix by clone in setLocal", () => {
    const sut = fixture.createShapeNode("shape", { kind: "point", value: "S" });
    const source = fixture.createTranslationMatrix(9, 11);

    sut.setLocal(source);

    expect(sut.local.equals(source)).toBe(true);
    expect(sut.local).not.toBe(source);
  });

  it("should reset world from its own local matrix when operation is called", () => {
    const sut = fixture.createShapeNode("shape", { kind: "point", value: "S" });
    const parent = fixture.createTranslationMatrix(30, 40);

    sut.translate(2, 3);
    sut.updateWorld(parent);

    expect(SceneGraphFixture.readTranslationFromMatrix(sut.world)).toEqual({
      x: 32,
      y: 43,
    });

    sut.operation();

    expect(SceneGraphFixture.readTranslationFromMatrix(sut.world)).toEqual({
      x: 2,
      y: 3,
    });
  });
});