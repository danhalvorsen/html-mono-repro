// packages/core-scene-graph/tests/SceneNode.unit.test.ts

import { describe, expect, it } from "vitest";
import { SceneGraphFixture } from "./fixtures/SceneGraphFixture.js";

describe("SceneNode", () => {
  const fixture = new SceneGraphFixture();

  it("should start with identity local and world matrices", () => {
    const sut = fixture.createSceneNode("node");

    expect(sut.local.equals(fixture.createIdentityMatrix())).toBe(true);
    expect(sut.world.equals(fixture.createIdentityMatrix())).toBe(true);
  });

  it("should replace local matrix by clone in setLocal", () => {
    const sut = fixture.createSceneNode("node");
    const source = fixture.createTranslationMatrix(11, 13);

    sut.setLocal(source);

    expect(sut.local.equals(source)).toBe(true);
    expect(sut.local).not.toBe(source);
  });

  it("should support translate rotate and scale fluently", () => {
    const sut = fixture.createSceneNode("node");

    expect(sut.translate(1, 2)).toBe(sut);
    expect(sut.rotate(Math.PI / 4)).toBe(sut);
    expect(sut.scale(2, 3)).toBe(sut);
  });

  it("should update world from parent matrix", () => {
    const sut = fixture.createSceneNode("node");
    const parent = fixture.createTranslationMatrix(100, 200);

    sut.translate(5, 7);
    sut.updateWorld(parent);

    expect(SceneGraphFixture.readTranslationFromMatrix(sut.world)).toEqual({
      x: 105,
      y: 207,
    });
  });

  it("should update child world matrices when operation is called", () => {
    const root = fixture.createSceneNode("root");
    const child = fixture.createShapeNode("child", { kind: "point", value: "C" });

    root.translate(10, 20);
    child.translate(2, 3);
    root.add(child);

    root.operation();

    expect(SceneGraphFixture.readTranslationFromMatrix(root.world)).toEqual({
      x: 10,
      y: 20,
    });

    expect(SceneGraphFixture.readTranslationFromMatrix(child.world)).toEqual({
      x: 12,
      y: 23,
    });
  });
});