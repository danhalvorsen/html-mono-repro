import { describe, expect, it } from "vitest";

import {
  DGMLForceDirectedLayoutStrategy,
  DGMLLayeredLayoutStrategy,
  DGMLLayoutStrategyResolver,
  MSAGLExternalEngineStrategy,
} from "../src/index.js";
import { box, buildGraph, canvas } from "./fixtures/layoutFixture.js";

function byId(anchors: readonly { id: string; centerX: number; centerY: number }[]) {
  return Object.fromEntries(anchors.map((anchor) => [anchor.id, anchor]));
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

  it("supports top-to-bottom layered flow", () => {
    const strategy = new DGMLLayeredLayoutStrategy({ direction: "top-to-bottom" });
    const graph = buildGraph(3, [[0, 1], [1, 2]]);
    const result = strategy.createLayout({ graph, canvas, box });
    const anchors = byId(result.nodeAnchors);

    expect(anchors["node-0"]!.centerY).toBeLessThan(anchors["node-1"]!.centerY);
    expect(anchors["node-1"]!.centerY).toBeLessThan(anchors["node-2"]!.centerY);
  });

  it("supports bottom-to-top layered flow", () => {
    const strategy = new DGMLLayeredLayoutStrategy({ direction: "bottom-to-top" });
    const graph = buildGraph(3, [[0, 1], [1, 2]]);
    const result = strategy.createLayout({ graph, canvas, box });
    const anchors = byId(result.nodeAnchors);

    expect(anchors["node-0"]!.centerY).toBeGreaterThan(anchors["node-1"]!.centerY);
    expect(anchors["node-1"]!.centerY).toBeGreaterThan(anchors["node-2"]!.centerY);
  });

  it("supports left-to-right layered flow", () => {
    const strategy = new DGMLLayeredLayoutStrategy({ direction: "left-to-right" });
    const graph = buildGraph(3, [[0, 1], [1, 2]]);
    const result = strategy.createLayout({ graph, canvas, box });
    const anchors = byId(result.nodeAnchors);

    expect(anchors["node-0"]!.centerX).toBeLessThan(anchors["node-1"]!.centerX);
    expect(anchors["node-1"]!.centerX).toBeLessThan(anchors["node-2"]!.centerX);
  });

  it("supports right-to-left layered flow", () => {
    const strategy = new DGMLLayeredLayoutStrategy({ direction: "right-to-left" });
    const graph = buildGraph(3, [[0, 1], [1, 2]]);
    const result = strategy.createLayout({ graph, canvas, box });
    const anchors = byId(result.nodeAnchors);

    expect(anchors["node-0"]!.centerX).toBeGreaterThan(anchors["node-1"]!.centerX);
    expect(anchors["node-1"]!.centerX).toBeGreaterThan(anchors["node-2"]!.centerX);
  });

  it("supports clustered placement for disconnected components", () => {
    const strategy = new DGMLLayeredLayoutStrategy({
      direction: "top-to-bottom",
      clusterByWeaklyConnectedComponents: true,
      clusterGap: 80,
    });
    const graph = buildGraph(4, [[0, 1], [2, 3]]);
    const result = strategy.createLayout({ graph, canvas, box });
    const anchors = byId(result.nodeAnchors);
    const componentLeftCenter = (anchors["node-0"]!.centerX + anchors["node-1"]!.centerX) / 2;
    const componentRightCenter = (anchors["node-2"]!.centerX + anchors["node-3"]!.centerX) / 2;

    expect(componentLeftCenter).toBeLessThan(componentRightCenter);
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

  it("resolves right-to-left layered when preferred", () => {
    const resolver = new DGMLLayoutStrategyResolver({ preferred: "layered-right-to-left" });
    const strategy = resolver.resolve({ graph: buildGraph(3, [[0, 1], [1, 2]]), canvas, box });
    const result = strategy.createLayout({ graph: buildGraph(3, [[0, 1], [1, 2]]), canvas, box });
    const anchors = byId(result.nodeAnchors);

    expect(anchors["node-0"]!.centerX).toBeGreaterThan(anchors["node-1"]!.centerX);
    expect(anchors["node-1"]!.centerX).toBeGreaterThan(anchors["node-2"]!.centerX);
  });

  it("resolves clustered mode when preferred", () => {
    const resolver = new DGMLLayoutStrategyResolver({ preferred: "clustered" });
    const graph = buildGraph(4, [[0, 1], [2, 3]]);
    const strategy = resolver.resolve({ graph, canvas, box });
    const result = strategy.createLayout({ graph, canvas, box });
    const anchors = byId(result.nodeAnchors);
    const componentLeftCenter = (anchors["node-0"]!.centerX + anchors["node-1"]!.centerX) / 2;
    const componentRightCenter = (anchors["node-2"]!.centerX + anchors["node-3"]!.centerX) / 2;

    expect(componentLeftCenter).toBeLessThan(componentRightCenter);
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