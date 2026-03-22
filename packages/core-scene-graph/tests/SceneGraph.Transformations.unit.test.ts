// ====================================================================================
// FILE: packages/core-scene-graph/tests/SceneGraph.Transformations.unit.test.ts
// PURPOSE:
// - Covers the core scene graph contract:
//   1) child world = parent world * child local
//   2) sibling independence
//   3) parent rotation affects child translation
//   4) parent rotation propagates through deeper hierarchies
//   5) local matrix mutations stay local until graph update
// ====================================================================================

import { describe, expect, it } from "vitest";
import { Matrix } from "@monorepo/core-math";
import { SceneGraphFixture } from "./fixtures/SceneGraphFixture.js";

describe("SceneGraph transformations", () => {
  const fixture = new SceneGraphFixture();

  function expectTranslationApproximately(
    actual: { x: number; y: number },
    expected: { x: number; y: number },
    precision: number = 10,
  ): void {
    expect(actual.x).toBeCloseTo(expected.x, precision);
    expect(actual.y).toBeCloseTo(expected.y, precision);
  }

  function expectRotationApproximately(
    actualRadians: number,
    expectedRadians: number,
    precision: number = 10,
  ): void {
    expect(actualRadians).toBeCloseTo(expectedRadians, precision);
  }

  it("should propagate parent translation to child world position", () => {
    const root = fixture.createSceneNode("root");
    const child = fixture.createShapeNode("child", {
      kind: "point",
      value: "C",
    });
    const graph = fixture.createGraph(root);

    root.translate(10, 20);
    child.translate(5, 7);
    root.add(child);

    graph.update();

    expectTranslationApproximately(
      SceneGraphFixture.readTranslationFromMatrix(child.world),
      { x: 15, y: 27 },
    );
  });

  it("should not affect sibling world position when one sibling local transform changes", () => {
    const root = fixture.createSceneNode("root");
    const siblingA = fixture.createShapeNode("sibling-a", {
      kind: "point",
      value: "A",
    });
    const siblingB = fixture.createShapeNode("sibling-b", {
      kind: "point",
      value: "B",
    });
    const graph = fixture.createGraph(root);

    root.translate(100, 200);
    siblingA.translate(10, 0);
    siblingB.translate(0, 20);

    root.add(siblingA);
    root.add(siblingB);

    graph.update();

    const beforeA = SceneGraphFixture.readTranslationFromMatrix(siblingA.world);
    const beforeB = SceneGraphFixture.readTranslationFromMatrix(siblingB.world);

    siblingA.translate(5, 6);
    graph.update();

    const afterA = SceneGraphFixture.readTranslationFromMatrix(siblingA.world);
    const afterB = SceneGraphFixture.readTranslationFromMatrix(siblingB.world);

    expectTranslationApproximately(beforeA, { x: 110, y: 200 });
    expectTranslationApproximately(beforeB, { x: 100, y: 220 });

    expectTranslationApproximately(afterA, { x: 115, y: 206 });
    expectTranslationApproximately(afterB, { x: 100, y: 220 });
  });

  it("should propagate parent rotation to child world rotation", () => {
    const root = fixture.createSceneNode("root");
    const child = fixture.createShapeNode("child", {
      kind: "point",
      value: "C",
    });
    const graph = fixture.createGraph(root);

    root.rotate(Math.PI / 2);
    root.add(child);

    graph.update();

    const childRotation = SceneGraphFixture.readApproximateRotationFromMatrix(
      child.world,
    );

    expectRotationApproximately(childRotation, Math.PI / 2);
  });

  it("should rotate child local translation by parent rotation", () => {
    const root = fixture.createSceneNode("root");
    const child = fixture.createShapeNode("child", {
      kind: "point",
      value: "C",
    });
    const graph = fixture.createGraph(root);

    root.rotate(Math.PI / 2);
    child.translate(10, 0);
    root.add(child);

    graph.update();

    expectTranslationApproximately(
      SceneGraphFixture.readTranslationFromMatrix(child.world),
      { x: 0, y: 10 },
    );
  });

  it("should combine parent translation and parent rotation when computing child world", () => {
    const root = fixture.createSceneNode("root");
    const child = fixture.createShapeNode("child", {
      kind: "point",
      value: "C",
    });
    const graph = fixture.createGraph(root);

    root.translate(5, 10);
    root.rotate(Math.PI / 2);
    child.translate(2, 0);
    root.add(child);

    graph.update();

    expectTranslationApproximately(
      SceneGraphFixture.readTranslationFromMatrix(child.world),
      { x: -10, y: 7 },
    );
  });

  it("should propagate hierarchical rotation through multiple levels", () => {
    const root = fixture.createSceneNode("root");
    const group = fixture.createSceneNode("group");
    const leaf = fixture.createShapeNode("leaf", { kind: "point", value: "L" });
    const graph = fixture.createGraph(root);

    root.rotate(Math.PI / 2);
    group.translate(10, 0);
    leaf.translate(5, 0);

    root.add(group);
    group.add(leaf);

    graph.update();

    expectTranslationApproximately(
      SceneGraphFixture.readTranslationFromMatrix(group.world),
      { x: 0, y: 10 },
    );

    expectTranslationApproximately(
      SceneGraphFixture.readTranslationFromMatrix(leaf.world),
      { x: 0, y: 15 },
    );
  });

  it("should keep child local matrix unchanged after parent update", () => {
    const root = fixture.createSceneNode("root");
    const child = fixture.createShapeNode("child", {
      kind: "point",
      value: "C",
    });
    const graph = fixture.createGraph(root);

    root.translate(100, 200);
    child.translate(3, 4);
    root.add(child);

    const localBeforeUpdate = child.local.clone();

    graph.update();

    expect(child.local.equals(localBeforeUpdate)).toBe(true);
    expectTranslationApproximately(
      SceneGraphFixture.readTranslationFromMatrix(child.local),
      { x: 3, y: 4 },
    );
    expectTranslationApproximately(
      SceneGraphFixture.readTranslationFromMatrix(child.world),
      { x: 103, y: 204 },
    );
  });

  it("should replace local matrix by clone in setLocal", () => {
    const sut = fixture.createShapeNode("shape", { kind: "point", value: "S" });
    const source = Matrix.translation(9, 11);

    sut.setLocal(source);

    expect(sut.local.equals(source)).toBe(true);
    expect(sut.local).not.toBe(source);
  });

  it("should update world deterministically on repeated graph updates", () => {
    const { graph, leaf } = fixture.createTranslatedGraph();

    graph.update();
    const first = SceneGraphFixture.readTranslationFromMatrix(leaf.world);

    graph.update();
    const second = SceneGraphFixture.readTranslationFromMatrix(leaf.world);

    expectTranslationApproximately(first, { x: 17, y: 30 });
    expectTranslationApproximately(second, { x: 17, y: 30 });
  });
});
