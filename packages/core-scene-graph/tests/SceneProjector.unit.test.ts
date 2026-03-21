// ====================================================================================
// FILE: packages/core-scene-graph/tests/SceneProjector.unit.test.ts
// ====================================================================================

import { describe, expect, it } from "vitest";
import { SceneGraphFixture } from "./fixtures/SceneGraphFixture.js";

describe("SceneProjector", () => {
  const fixture = new SceneGraphFixture();

  it("should project only shape nodes", () => {
    const { graph } = fixture.createTranslatedGraph();
    const sut = fixture.createProjector();

    graph.update();

    const result = sut.project(graph);

    expect(result).toEqual([
      {
        name: "leaf",
        value: "A",
        x: 17,
        y: 30,
      },
    ]);
  });

  it("should return empty when graph contains no shape nodes", () => {
    const { root } = fixture.createRootWithChild();
    const sut = fixture.createProjector();
    const graph = fixture.createGraph(root);

    graph.update();

    expect(sut.project(graph)).toEqual([]);
  });

  it("should project multiple shape nodes", () => {
    const { root, groupA, groupB, leafA, leafB, graph } =
      fixture.createNestedGraph();
    const sut = fixture.createProjector();

    root.translate(10, 10);
    groupA.translate(1, 2);
    groupB.translate(3, 4);
    leafA.translate(5, 6);
    leafB.translate(7, 8);

    graph.update();

    const result = sut.project(graph);

    expect(result).toEqual([
      {
        name: "leaf-a",
        value: "A",
        x: 16,
        y: 18,
      },
      {
        name: "leaf-b",
        value: "B",
        x: 20,
        y: 22,
      },
    ]);
  });

  it("should project nested shape nodes through container nodes", () => {
    const root = fixture.createSceneNode("root");
    const group = fixture.createSceneNode("group");
    const childGroup = fixture.createSceneNode("child-group");
    const leafA = fixture.createShapeNode("leaf-a", {
      kind: "point",
      value: "P1",
    });
    const leafB = fixture.createShapeNode("leaf-b", {
      kind: "point",
      value: "P2",
    });

    root.translate(10, 20);
    group.translate(5, 5);
    childGroup.translate(2, 3);
    leafA.translate(1, 1);
    leafB.translate(4, 6);

    root.add(group);
    group.add(childGroup);
    group.add(leafA);
    childGroup.add(leafB);

    const graph = fixture.createGraph(root);
    const sut = fixture.createProjector();

    graph.update();

    expect(sut.project(graph)).toEqual([
      {
        name: "leaf-b",
        value: "P2",
        x: 21,
        y: 34,
      },
      {
        name: "leaf-a",
        value: "P1",
        x: 16,
        y: 26,
      },
    ]);
  });
});
