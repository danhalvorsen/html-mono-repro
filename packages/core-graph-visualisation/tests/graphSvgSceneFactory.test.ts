import { describe, expect, it } from "vitest";

import { GraphSvgSceneFixture } from "./fixtures/GraphSvgSceneFixture.js";

describe("GraphSvgSceneFactory", () => {
  const fixture = new GraphSvgSceneFixture();

  it("should create svg edge coordinates from the graph layout", () => {
    const graph = fixture.createGraphWithEdge("source", "target");
    const factory = fixture.createFactory();

    const scene = factory.createScene(graph, fixture.createSceneOptions());

    expect(scene.nodes.map((node) => node.id)).toEqual(["source", "target"]);
    expect(scene.boundary).toEqual({
      topLeft: { x: 0, y: 0 },
      width: 300,
      height: 120,
    });
    expect(scene.edges).toEqual([
      {
        id: "edge-0-source-target",
        start: {
          nodeId: "source",
          connector: { x: 100, y: 40 },
        },
        edge: {
          path: "M 100 40 L 200 40",
        },
        end: {
          nodeId: "target",
          connector: { x: 200, y: 40 },
        },
      },
    ]);
  });

  it("should reject invalid node width values", () => {
    const graph = fixture.createEmptyGraph();
    const factory = fixture.createFactory();

    expect(() =>
      factory.createScene(graph, fixture.createSceneOptions({
        boxWidth: 0,
      })),
    ).toThrowError("Graph box width must be greater than zero.");
  });

  it("should create circle nodes with 4 box-style connectors by default", () => {
    const graph = fixture.createGraphWithNode("circle-a");
    const factory = fixture.createFactory();

    const scene = factory.createScene(graph, fixture.createSceneOptions({
      height: 200,
      boxHeight: 80,
      nodeRepresentation: "circle",
    }));

    const node = scene.nodes[0]!;

    expect(node.representation).toBe("circle");
    expect(node.circle).toEqual({ radius: 40 });
    expect(node.connectionPoints.map((connectionPoint) => connectionPoint.role)).toEqual([
      "top",
      "right",
      "bottom",
      "left",
    ]);
    expect(node.connectionPoints.map((connectionPoint) => connectionPoint.angleDegrees)).toEqual([
      270,
      0,
      90,
      180,
    ]);
  });

  it("should support fixed custom circle connector angles from node payload", () => {
    const graph = fixture.createGraphWithNode("circle-custom", {
      visual: {
        representation: "circle",
        circleConnectors: {
          mode: "fixed",
          angles: [45, 180, 315],
        },
      },
    });

    const factory = fixture.createFactory();

    const scene = factory.createScene(graph, fixture.createSceneOptions({
      height: 200,
      boxHeight: 80,
    }));

    const node = scene.nodes[0]!;

    expect(node.representation).toBe("circle");
    expect(node.connectionPoints.map((connectionPoint) => connectionPoint.angleDegrees)).toEqual([
      45,
      180,
      315,
    ]);
    expect(node.connectionPoints.map((connectionPoint) => connectionPoint.role)).toEqual([
      "angle-45",
      "angle-180",
      "angle-315",
    ]);
  });

  it("should create edge line from connector center to connector center", () => {
    const graph = fixture.createGraphWithEdge("source", "target");
    const factory = fixture.createFactory();

    const scene = factory.createScene(graph, fixture.createSceneOptions({
      height: 200,
      boxHeight: 80,
      nodeRepresentation: "circle",
    }));

    const sourceNode = scene.nodes.find((node) => node.id === "source");
    const targetNode = scene.nodes.find((node) => node.id === "target");
    const edge = scene.edges[0];

    expect(sourceNode).toBeDefined();
    expect(targetNode).toBeDefined();
    expect(edge).toBeDefined();

    const hasSourceConnector = sourceNode?.connectionPoints.some(
      (connectionPoint) =>
        connectionPoint.connector.x === edge?.start.connector.x
        && connectionPoint.connector.y === edge?.start.connector.y,
    );
    const hasTargetConnector = targetNode?.connectionPoints.some(
      (connectionPoint) =>
        connectionPoint.connector.x === edge?.end.connector.x
        && connectionPoint.connector.y === edge?.end.connector.y,
    );

    expect(hasSourceConnector).toBe(true);
    expect(hasTargetConnector).toBe(true);
    expect(edge?.edge.path).toBe(
      `M ${edge?.start.connector.x} ${edge?.start.connector.y} L ${edge?.end.connector.x} ${edge?.end.connector.y}`,
    );
  });
});
