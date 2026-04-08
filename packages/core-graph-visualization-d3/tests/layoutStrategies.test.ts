import { describe, expect, it } from "vitest";
import { D3ForceGraphLayoutStrategy, type D3ForceLayoutOptions } from "../src/D3ForceGraphLayoutStrategy.js";
import { SimulationD3SpringSimulation } from "../src/SimulationD3SpringSimulation.js";
import { box, buildGraph, canvas } from "./fixtures/layoutFixture.js";

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

describe("SimulationD3SpringSimulation", () => {
  it("exposes a stable strategy name", () => {
    const strategy = new SimulationD3SpringSimulation();

    expect(strategy.name).toBe("SimulationD3SpringSimulation");
  });

  it("creates a session with one anchor per node", () => {
    const strategy = new SimulationD3SpringSimulation();
    const session = strategy.createSimulation({ graph: buildGraph(4, [[0, 1], [1, 2]]), canvas, box });
    const model = session.getCurrentLayout();

    expect(model.nodeAnchors).toHaveLength(4);
    expect(model.edgeConstraints).toHaveLength(2);
    session.dispose();
  });

  it("notifies listeners when ticking the simulation", () => {
    const strategy = new SimulationD3SpringSimulation();
    const session = strategy.createSimulation({ graph: buildGraph(3, [[0, 1], [1, 2]]), canvas, box });
    let tickCount = 0;
    const unsubscribe = session.onTick(() => {
      tickCount += 1;
    });

    session.tick(3);
    unsubscribe();
    session.dispose();

    expect(tickCount).toBeGreaterThan(0);
  });

  it("supports createLayout for settled snapshots", () => {
    const strategy = new SimulationD3SpringSimulation({
      chargeStrength: -140,
      linkDistance: 70,
      alphaDecay: 0.03,
      velocityDecay: 0.35,
      settleTicks: 40,
    });

    const model = strategy.createLayout({ graph: buildGraph(5, [[0, 1], [0, 2], [2, 3], [3, 4]]), canvas, box });

    expect(model.nodeAnchors).toHaveLength(5);
    expect(model.edgeConstraints).toHaveLength(4);
  });
});