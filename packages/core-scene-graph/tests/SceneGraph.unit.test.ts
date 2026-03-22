// ====================================================================================
// FILE: packages/core-scene-graph/tests/SceneGraph.unit.test.ts
// ====================================================================================

import { describe, expect, it } from "vitest";
import { SceneGraphFixture } from "./fixtures/SceneGraphFixture.js";

describe("SceneGraph", () => {
  const fixture = new SceneGraphFixture();

  it("should update the graph from the root", () => {
    const { graph, leaf } = fixture.createTranslatedGraph();

    graph.update();

    expect(SceneGraphFixture.readTranslationFromMatrix(leaf.world)).toEqual({
      x: 17,
      y: 30,
    });
  });

  it("should traverse the graph depth first", () => {
    const { graph } = fixture.createNestedGraph();

    expect(fixture.traverseNames(graph)).toEqual([
      "root",
      "group-a",
      "leaf-a",
      "group-b",
      "leaf-b",
    ]);
  });

  it("should traverse a graph with only root", () => {
    const graph = fixture.createGraph(fixture.createSceneNode("root"));

    expect(fixture.traverseNames(graph)).toEqual(["root"]);
  });

  it("should allow a visitor to inspect every node", () => {
    const { graph } = fixture.createNestedGraph();
    let count = 0;

    graph.traverse(() => {
      count += 1;
    });

    expect(count).toBe(5);
  });

  it("should not require getChildren type narrowing because all scene nodes implement the contract", () => {
    const { graph } = fixture.createNestedGraph();
    const visited: string[] = [];

    graph.traverse((node) => {
      visited.push(`${node.name}:${node.getChildren().length}`);
    });

    expect(visited).toEqual([
      "root:2",
      "group-a:1",
      "leaf-a:0",
      "group-b:1",
      "leaf-b:0",
    ]);
  });
});