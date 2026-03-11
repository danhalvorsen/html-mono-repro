// packages/core-graph/tests/dagGraph.test.ts

import { describe, expect, it } from "vitest";
import { fixture } from "./Fixtures.js";

describe("DagGraph", () => {
  it("adds nodes", () => {
    const { graph, nodes } = fixture.createDagWithNodes("A", "B");

    expect(graph.nodes).toHaveLength(2);
    expect(nodes.A.id).toBe("A");
    expect(nodes.B.id).toBe("B");
  });

  it("adds edges correctly", () => {
    const { graph, nodes } = fixture.createDagWithNodes("A", "B");

    const edge = graph.addEdge(nodes.A, nodes.B);

    expect(graph.edges).toHaveLength(1);
    expect(edge.source.id).toBe("A");
    expect(edge.target.id).toBe("B");
  });

  it("rejects direct 2-node cycle and rolls back", () => {
    const { graph, nodes } = fixture.createDagWithNodes("A", "B");

    graph.addEdge(nodes.A, nodes.B);

    expect(() => graph.addEdge(nodes.B, nodes.A))
      .toThrowError("Cycle detected adding B->A");

    expect(graph.edges).toHaveLength(1);
  });

  it("rejects long-chain cycle and rolls back", () => {
    const { graph, nodes } = fixture.createDagWithNodes("A", "B", "C", "D");

    graph.addEdge(nodes.A, nodes.B);
    graph.addEdge(nodes.B, nodes.C);
    graph.addEdge(nodes.C, nodes.D);

    expect(() => graph.addEdge(nodes.D, nodes.A))
      .toThrowError("Cycle detected adding D->A");

    expect(graph.edges).toHaveLength(3);
  });

  it("handles large DAG without cycles", () => {
    const { graph } = fixture.createDagChain(50);

    expect(graph.isAcyclic).toBe(true);
    expect(graph.edges).toHaveLength(49);
  });

  it("detects backward-edge cycle in large graph", () => {
    const { graph, nodes } = fixture.createDagChain(20);

    expect(() => graph.addEdge(nodes[10], nodes[5]))
      .toThrowError("Cycle detected adding N10->N5");

    expect(graph.edges).toHaveLength(19);
  });
});