import { describe, it, expect } from "vitest";
 
import { DagGraph } from "../src/DagGraph.js";
  
describe("DagGraph", () => {

  it("adds nodes", () => {
    const g = new DagGraph();
    const a = g.addNode("A");
    const b = g.addNode("B");
    expect(g.nodes.length).toBe(2);
    expect(a.id).toBe("A");
    expect(b.id).toBe("B");
  });

  it("adds edges correctly", () => {
    const g = new DagGraph();
    const a = g.addNode("A");
    const b = g.addNode("B");

    const e = g.addEdge(a, b);
    expect(g.edges.length).toBe(1);
    expect(e.source.id).toBe("A");
    expect(e.target.id).toBe("B");
  });

  it("rejects direct 2-node cycle and rolls back", () => {
    const g = new DagGraph();
    const a = g.addNode("A");
    const b = g.addNode("B");

    g.addEdge(a, b);
    expect(() => g.addEdge(b, a))
      .toThrowError("Cycle detected adding B->A");

    expect(g.edges.length).toBe(1); // rolled back
  });

  it("rejects long-chain cycle and rolls back", () => {
    const g = new DagGraph();
    const a = g.addNode("A");
    const b = g.addNode("B");
    const c = g.addNode("C");
    const d = g.addNode("D");

    g.addEdge(a, b);
    g.addEdge(b, c);
    g.addEdge(c, d);

    expect(() => g.addEdge(d, a))
      .toThrowError("Cycle detected adding D->A");

    expect(g.edges.length).toBe(3);
  });

  it("handles large DAG without cycles", () => {
    const g = new DagGraph();
    const nodes = [...Array(50)].map((_, i) => g.addNode("N" + i));

    for (let i = 0; i < nodes.length - 1; i++) {
      g.addEdge(nodes[i], nodes[i + 1]);
    }

    expect(g.isAcyclic).toBe(true);
    expect(g.edges.length).toBe(49);
  });

  it("detects backward-edge cycle in large graph", () => {
    const g = new DagGraph();
    const nodes = [...Array(20)].map((_, i) => g.addNode("N" + i));

    for (let i = 0; i < 19; i++) g.addEdge(nodes[i], nodes[i + 1]);

    expect(() => g.addEdge(nodes[10], nodes[5]))
      .toThrowError("Cycle detected adding N10->N5");

    expect(g.edges.length).toBe(19);
  });

});