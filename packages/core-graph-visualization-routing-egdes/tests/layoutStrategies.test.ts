import { describe, expect, it, vi } from "vitest";

import {
  DGMLForceDirectedLayoutStrategy,
  DGMLLayeredLayoutStrategy,
  DGMLLayoutStrategyResolver,
  MSAGLExternalEngineStrategy,
  createDirectEdgeRoutingConstraints,
} from "../dist/index.js";
import { box, buildGraph, canvas } from "./fixtures/layoutFixture.js";

describe("createDirectEdgeRoutingConstraints", () => {
  it("maps all graph edges to source/target route constraints", () => {
    const graph = buildGraph(4, [[0, 1], [0, 2], [2, 3]]);
    const constraints = createDirectEdgeRoutingConstraints({ graph, canvas, box });

    expect(constraints).toEqual([
      { sourceNodeId: "node-0", targetNodeId: "node-1" },
      { sourceNodeId: "node-0", targetNodeId: "node-2" },
      { sourceNodeId: "node-2", targetNodeId: "node-3" },
    ]);
  });
});

describe("DGMLLayeredLayoutStrategy", () => {
  it("returns one anchor per node and one route per edge", () => {
    const strategy = new DGMLLayeredLayoutStrategy();
    const graph = buildGraph(6, [[0, 1], [0, 2], [1, 3], [2, 4], [3, 5], [4, 5]]);
    const result = strategy.createLayout({ graph, canvas, box });

    expect(result.nodeAnchors).toHaveLength(6);
    expect(result.edgeConstraints).toHaveLength(6);
  });

  it("keeps anchors inside canvas bounds", () => {
    const strategy = new DGMLLayeredLayoutStrategy({ maxNodesPerLayer: 4 });
    const graph = buildGraph(10, [[0, 1], [1, 2], [2, 3], [4, 5], [5, 6], [7, 8], [8, 9]]);
    const result = strategy.createLayout({ graph, canvas, box });
    const halfWidth = canvas.width / 2;
    const halfHeight = canvas.height / 2;

    result.nodeAnchors.forEach((anchor) => {
      expect(anchor.centerX).toBeGreaterThanOrEqual(-halfWidth);
      expect(anchor.centerX).toBeLessThanOrEqual(halfWidth);
      expect(anchor.centerY).toBeGreaterThanOrEqual(-halfHeight);
      expect(anchor.centerY).toBeLessThanOrEqual(halfHeight);
    });
  });
});

describe("DGMLForceDirectedLayoutStrategy", () => {
  it("returns deterministic force-directed anchors and direct edge routes", () => {
    const strategy = new DGMLForceDirectedLayoutStrategy({ iterations: 90 });
    const graph = buildGraph(5, [[0, 1], [1, 2], [2, 3], [3, 4]]);
    const result = strategy.createLayout({ graph, canvas, box });

    expect(result.nodeAnchors).toHaveLength(5);
    expect(result.edgeConstraints).toHaveLength(4);

    const run2 = strategy.createLayout({ graph, canvas, box });
    expect(run2.nodeAnchors).toEqual(result.nodeAnchors);
  });
});

describe("DGMLLayoutStrategyResolver", () => {
  it("resolves layered layout by default", () => {
    const resolver = new DGMLLayoutStrategyResolver();

    expect(resolver.resolve({ graph: buildGraph(5), canvas, box }).name).toBe("DGMLLayeredLayout");
  });

  it("resolves force-directed when preferred", () => {
    const resolver = new DGMLLayoutStrategyResolver({ preferred: "force-directed" });

    expect(resolver.resolve({ graph: buildGraph(5), canvas, box }).name).toBe("DGMLForceDirectedLayout");
  });

  it("falls back to force-directed for large graphs", () => {
    const resolver = new DGMLLayoutStrategyResolver({ maxLayeredNodeCount: 3 });

    expect(resolver.resolve({ graph: buildGraph(4), canvas, box }).name).toBe("DGMLForceDirectedLayout");
  });
});

describe("MSAGLExternalEngineStrategy", () => {
  it("delegates createLayout to the external engine", () => {
    const expected = {
      canvas,
      box,
      nodeAnchors: [{ id: "node-0", payload: null, centerX: 0, centerY: 0 }],
      edgeConstraints: [],
    };
    const externalEngine = {
      layout: vi.fn(() => expected),
    };
    const strategy = new MSAGLExternalEngineStrategy(externalEngine);
    const request = { graph: buildGraph(1), canvas, box };

    const result = strategy.createLayout(request);

    expect(externalEngine.layout).toHaveBeenCalledTimes(1);
    expect(externalEngine.layout).toHaveBeenCalledWith(request);
    expect(result).toEqual(expected);
  });
});
