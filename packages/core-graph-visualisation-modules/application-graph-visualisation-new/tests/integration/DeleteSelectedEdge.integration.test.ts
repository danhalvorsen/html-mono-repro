import { describe, expect, it } from "vitest";

import { createDeleteSelectedEdgeFixture } from "../fixtures/DeleteSelectedEdgeControllerFixture.js";

describe("Delete key integration", () => {
  it("Given a selected rendered edge when Delete is pressed then the relation and rendered edge are removed while nodes remain", () => {
    const fixture = createDeleteSelectedEdgeFixture();
    const before = fixture.scene();
    const selectedEdge = before.edges.find((edge) => edge.start.nodeId === "A" && edge.end.nodeId === "B");

    expect(selectedEdge).toBeDefined();

    fixture.setHighlightedEdge(selectedEdge?.id);
    fixture.pressDelete();

    const after = fixture.scene();

    expect(fixture.graphEdgePairs()).toEqual(["B->C"]);
    expect(after.edges.some((edge) => edge.id === selectedEdge?.id)).toBe(false);
    expect(fixture.graph.nodes.map((node) => node.id)).toEqual(["A", "B", "C"]);
  });

  it("Given no selected edge when Delete is pressed then graph and render stay unchanged", () => {
    const fixture = createDeleteSelectedEdgeFixture();
    const beforePairs = fixture.graphEdgePairs();
    const beforePaths = fixture.scene().edges.map((edge) => edge.edge.path);

    fixture.pressDelete();

    expect(fixture.graphEdgePairs()).toEqual(beforePairs);
    expect(fixture.scene().edges.map((edge) => edge.edge.path)).toEqual(beforePaths);
  });
});
