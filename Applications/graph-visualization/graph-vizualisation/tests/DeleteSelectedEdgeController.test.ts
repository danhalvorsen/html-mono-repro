import { describe, expect, it } from "vitest";

import { createDeleteSelectedEdgeFixture } from "./fixtures/DeleteSelectedEdgeControllerFixture.js";

describe("DeleteSelectedEdgeController", () => {
  it("should delete selected edge relation and clear highlighted edge state", () => {
    const fixture = createDeleteSelectedEdgeFixture();
    const initialScene = fixture.scene();
    const selectedEdgeId = initialScene.edges[0]?.id;

    expect(selectedEdgeId).toBeDefined();

    fixture.setHighlightedEdge(selectedEdgeId);
    fixture.pressDelete();

    expect(fixture.graphEdgePairs()).toEqual(["B->C"]);
    expect(fixture.host.getHighlightedEdgeId()).toBeUndefined();
  });

  it("should remove only highlighted relation when multiple edges exist", () => {
    const fixture = createDeleteSelectedEdgeFixture();
    const edges = fixture.scene().edges;
    const selectedEdgeId = edges.find((edge) => edge.start.nodeId === "B" && edge.end.nodeId === "C")?.id;

    expect(selectedEdgeId).toBeDefined();

    fixture.setHighlightedEdge(selectedEdgeId);
    fixture.pressDelete();

    expect(fixture.graphEdgePairs()).toEqual(["A->B"]);
    expect(fixture.graph.nodes.map((node) => node.id)).toEqual(["A", "B", "C"]);
  });

  it("should do nothing when no edge is selected", () => {
    const fixture = createDeleteSelectedEdgeFixture();

    fixture.pressDelete();

    expect(fixture.graphEdgePairs()).toEqual(["A->B", "B->C"]);
  });

  it("should ignore node selection when no edge is selected", () => {
    const fixture = createDeleteSelectedEdgeFixture();

    fixture.selectionState.select("B");
    fixture.pressDelete();

    expect(fixture.selectionState.selectedNodeId).toBe("B");
    expect(fixture.graphEdgePairs()).toEqual(["A->B", "B->C"]);
  });

  it("should remove the correct source-target relation only", () => {
    const fixture = createDeleteSelectedEdgeFixture();
    const selectedEdgeId = fixture.scene().edges
      .find((edge) => edge.start.nodeId === "A" && edge.end.nodeId === "B")?.id;

    fixture.setHighlightedEdge(selectedEdgeId);
    fixture.pressDelete();

    expect(fixture.graphEdgePairs()).toEqual(["B->C"]);
  });

  it("should update rendered graph immediately after deletion", () => {
    const fixture = createDeleteSelectedEdgeFixture();
    const selectedEdgeId = fixture.scene().edges[0]?.id;

    fixture.setHighlightedEdge(selectedEdgeId);
    fixture.pressDelete();

    const sceneAfterDelete = fixture.scene();

    expect(sceneAfterDelete.edges).toHaveLength(1);
    expect(sceneAfterDelete.edges[0]?.id).not.toBe(selectedEdgeId);
  });

  it("should remove exact rendered path for deleted relation", () => {
    const fixture = createDeleteSelectedEdgeFixture();
    const sceneBeforeDelete = fixture.scene();
    const selectedEdge = sceneBeforeDelete.edges.find((edge) => edge.start.nodeId === "A" && edge.end.nodeId === "B");

    expect(selectedEdge).toBeDefined();

    fixture.setHighlightedEdge(selectedEdge?.id);
    fixture.pressDelete();

    const remainingPaths = fixture.scene().edges.map((edge) => edge.edge.path);

    expect(remainingPaths).not.toContain(selectedEdge?.edge.path);
  });
});
