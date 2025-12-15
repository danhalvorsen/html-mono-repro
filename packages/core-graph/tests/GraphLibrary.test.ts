import { describe, it, expect } from "vitest";
 
import { DagGraph } from "../src/DagGraph.js";
describe("DagGraph", () => {

  it("adds nodes correctly", () => {
    const g = new DagGraph();
    const a = g.addNode("A", 123);
    const b = g.addNode("B", 456);

    expect(g.nodes.length).toBe(2);
    expect(a.id).toBe("A");
    expect(a.payload).toBe(123);
    expect(b.id).toBe("B");
    expect(b.payload).toBe(456);
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

  it("detects cycles and rejects them", () => {
    const g = new DagGraph();
    const a = g.addNode("A");
    const b = g.addNode("B");

    g.addEdge(a, b);

    // Adding B → A creates a cycle A → B → A
    expect(() => g.addEdge(b, a)).toThrowError(
      "Cycle detected adding B->A"
    );

    // The illegal edge must be removed automatically
    expect(g.edges.length).toBe(1);
    expect(g.isAcyclic).toBe(true);
  });

  it("handles multiple edges without cycles", () => {
    const g = new DagGraph();
    const a = g.addNode("A");
    const b = g.addNode("B");
    const c = g.addNode("C");

    g.addEdge(a, b);
    g.addEdge(b, c);

    expect(g.isAcyclic).toBe(true);
    expect(g.edges.length).toBe(2);
  });

  it("detects large cycle chains", () => {
    const g = new DagGraph();
    const a = g.addNode("A");
    const b = g.addNode("B");
    const c = g.addNode("C");

    g.addEdge(a, b);
    g.addEdge(b, c);

    expect(() => g.addEdge(c, a)).toThrowError(
      "Cycle detected adding C->A"
    );

    // last edge removed
    expect(g.edges.length).toBe(2);
  });

});
