import { describe, expect, it } from "vitest";
import { D3ForceGraphLayoutStrategy, type D3ForceLayoutOptions } from "../src/D3ForceGraphLayoutStrategy.js";
import { Graph } from "@monorepo/core-graph";

const canvas = { width: 800, height: 600, padding: 48 };
const box = { width: 112, height: 56 };

function buildGraph(nodeCount: number, edges: [number, number][] = []) {
  const graph = new Graph();
  const nodes = Array.from({ length: nodeCount }, (_, i) => graph.addNode(`node-${i}`));
  for (const [s, t] of edges) {
    graph.addEdge(nodes[s]!, nodes[t]!);
  }
  return graph;
}

describe("D3ForceGraphLayoutStrategy", () => {
  describe("name", () => {
    it("should have a stable name", () => {
      const strategy = new D3ForceGraphLayoutStrategy();
      expect(strategy.name).toBe("D3ForceGraphLayout");
    });
  });

  describe("supports", () => {
    it("should support any graph layout request", () => {
      const strategy = new D3ForceGraphLayoutStrategy();
      const request = { graph: buildGraph(2), canvas, box };
      expect(strategy.supports(request)).toBe(true);
    });
  });

  describe("createLayout", () => {
    it("should return an empty layout for a graph with no nodes", () => {
      const strategy = new D3ForceGraphLayoutStrategy();
      const result = strategy.createLayout({ graph: buildGraph(0), canvas, box });
      expect(result.nodeAnchors).toHaveLength(0);
      expect(result.edgeConstraints).toHaveLength(0);
    });

    it("should produce one anchor per node", () => {
      const strategy = new D3ForceGraphLayoutStrategy();
      const result = strategy.createLayout({ graph: buildGraph(4), canvas, box });
      expect(result.nodeAnchors).toHaveLength(4);
    });

    it("should produce one edge constraint per graph edge", () => {
      const strategy = new D3ForceGraphLayoutStrategy();
      const graph = buildGraph(3, [[0, 1], [1, 2]]);
      const result = strategy.createLayout({ graph, canvas, box });
      expect(result.edgeConstraints).toHaveLength(2);
    });

    it("should place all nodes within the canvas bounds", () => {
      const strategy = new D3ForceGraphLayoutStrategy();
      const result = strategy.createLayout({ graph: buildGraph(6, [[0,1],[1,2],[2,3],[3,4],[4,5]]), canvas, box });
      const halfW = canvas.width / 2;
      const halfH = canvas.height / 2;
      for (const anchor of result.nodeAnchors) {
        expect(anchor.centerX).toBeGreaterThanOrEqual(-halfW);
        expect(anchor.centerX).toBeLessThanOrEqual(halfW);
        expect(anchor.centerY).toBeGreaterThanOrEqual(-halfH);
        expect(anchor.centerY).toBeLessThanOrEqual(halfH);
      }
    });

    it("should preserve canvas and box constraints in the result", () => {
      const strategy = new D3ForceGraphLayoutStrategy();
      const result = strategy.createLayout({ graph: buildGraph(2), canvas, box });
      expect(result.canvas).toEqual(canvas);
      expect(result.box).toEqual(box);
    });

    it("should respect custom options", () => {
      const options: D3ForceLayoutOptions = { ticks: 10, chargeStrength: -50, linkDistance: 40 };
      const strategy = new D3ForceGraphLayoutStrategy(options);
      const result = strategy.createLayout({ graph: buildGraph(3, [[0,1]]), canvas, box });
      expect(result.nodeAnchors).toHaveLength(3);
    });
  });
});