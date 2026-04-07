import { describe, expect, it } from "vitest";

import {
  DGMLForceDirectedLayoutStrategy,
  DGMLLayeredLayoutStrategy,
  DGMLLayoutStrategyResolver,
  MSAGLExternalEngineStrategy,
} from "../src/index.js";

const canvas = { width: 900, height: 640, padding: 48 };
const box = { width: 120, height: 60 };

function buildGraph(nodeCount: number, edges: [number, number][] = []) {
  const nodes = Array.from({ length: nodeCount }, (_, i) => ({ id: `node-${i}`, payload: null }));
  const graphEdges = edges.map(([s, t]) => ({
    source: nodes[s]!,
    target: nodes[t]!,
  }));

  return {
    nodes,
    edges: graphEdges,
  };
}

describe("DGMLLayeredLayoutStrategy", () => {
  it("returns layered coordinates with one anchor per node", () => {
    const strategy = new DGMLLayeredLayoutStrategy();
    const graph = buildGraph(6, [[0, 1], [0, 2], [1, 3], [2, 4], [3, 5], [4, 5]]);
    const result = strategy.createLayout({ graph, canvas, box });

    expect(result.nodeAnchors).toHaveLength(6);
    expect(result.edgeConstraints).toHaveLength(6);
  });

  it("keeps anchors in canvas bounds", () => {
    const strategy = new DGMLLayeredLayoutStrategy({ maxNodesPerLayer: 4 });
    const graph = buildGraph(10, [[0, 1], [1, 2], [2, 3], [4, 5], [5, 6], [7, 8], [8, 9]]);
    const result = strategy.createLayout({ graph, canvas, box });
    const halfW = canvas.width / 2;
    const halfH = canvas.height / 2;

    result.nodeAnchors.forEach((anchor) => {
      expect(anchor.centerX).toBeGreaterThanOrEqual(-halfW);
      expect(anchor.centerX).toBeLessThanOrEqual(halfW);
      expect(anchor.centerY).toBeGreaterThanOrEqual(-halfH);
      expect(anchor.centerY).toBeLessThanOrEqual(halfH);
    });
  });
});

describe("DGMLForceDirectedLayoutStrategy", () => {
  it("creates deterministic force-based anchors", () => {
    const strategy = new DGMLForceDirectedLayoutStrategy({ iterations: 90 });
    const graph = buildGraph(5, [[0, 1], [1, 2], [2, 3], [3, 4]]);
    const result = strategy.createLayout({ graph, canvas, box });

    expect(result.nodeAnchors).toHaveLength(5);
    expect(result.edgeConstraints).toHaveLength(4);
  });
});

describe("DGMLLayoutStrategyResolver", () => {
  it("resolves layered by default", () => {
    const resolver = new DGMLLayoutStrategyResolver();
    const strategy = resolver.resolve({ graph: buildGraph(5), canvas, box });

    expect(strategy.name).toBe("DGMLLayeredLayout");
  });

  it("resolves force directed when preferred", () => {
    const resolver = new DGMLLayoutStrategyResolver({ preferred: "force-directed" });
    const strategy = resolver.resolve({ graph: buildGraph(5), canvas, box });

    expect(strategy.name).toBe("DGMLForceDirectedLayout");
  });
});

describe("MSAGLExternalEngineStrategy", () => {
  it("delegates layout call to external engine", () => {
    const expected = {
      canvas,
      box,
      nodeAnchors: [{ id: "n", payload: null, centerX: 0, centerY: 0 }],
      edgeConstraints: [],
    };
    const strategy = new MSAGLExternalEngineStrategy({
      layout: () => expected,
    });

    const result = strategy.createLayout({ graph: buildGraph(1), canvas, box });
    expect(result).toEqual(expected);
  });
});