// packages/core-graph/tests/graph.test.ts

import { describe, expect, it } from "vitest";
import { fixture } from "./Fixtures.js";

describe("Graph", () => {
  it("adds nodes", () => {
    const graph = fixture.createGraph();

    const node = graph.addNode("A");

    expect(graph.nodes).toHaveLength(1);
    expect(node.id).toBe("A");
  });

  it("adds nodes with payload", () => {
    const graph = fixture.createGraph();

    const node = graph.addNode("A", { x: 5 });

    expect(node.payload).toEqual({ x: 5 });
  });

  it("adds edges", () => {
    const { graph, nodes } = fixture.createGraphWithNodes("A", "B");

    const edge = graph.addEdge(nodes.A, nodes.B);

    expect(graph.edges).toHaveLength(1);
    expect(edge.source).toBe(nodes.A);
    expect(edge.target).toBe(nodes.B);
  });

  it("handles multiple nodes and edges", () => {
    const { graph, nodes } = fixture.createGraphWithNodes("A", "B", "C");

    graph.addEdge(nodes.A, nodes.B);
    graph.addEdge(nodes.B, nodes.C);

    expect(graph.edges).toHaveLength(2);
  });
});