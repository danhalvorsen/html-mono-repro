import { describe, expect, it } from "vitest";
import {
  EllipseTopologyFactory,
  LineTopologyFactory,
  PolygonTopologyFactory,
  PolylineTopologyFactory,
  RectangleTopologyFactory,
  ShapeEdgePointFactory,
  VertexAddressKeys,
} from "../src/index.js";

describe("topology factories", () => {
  const edgePointFactory = new ShapeEdgePointFactory();

  it("creates valid line topology", () => {
    const factory = new LineTopologyFactory(edgePointFactory);
    const topology = factory.create({
      id: "line-1",
      start: { x: 0, y: 0 },
      end: { x: 10, y: 10 },
    });

    expect(topology.vertices).toHaveLength(2);
    expect(topology.edges).toHaveLength(1);
    expect(topology.vertices[0]?.address.key).toBe(VertexAddressKeys.LeftCenter);
    expect(topology.vertices[1]?.address.key).toBe(VertexAddressKeys.RightCenter);
  });

  it("rejects invalid line input", () => {
    const factory = new LineTopologyFactory(edgePointFactory);

    expect(() =>
      factory.create({
        id: " ",
        start: { x: 0, y: 0 },
        end: { x: 10, y: 10 },
      })
    ).toThrow(/must not be empty/i);

    expect(() =>
      factory.create({
        id: "line-2",
        start: { x: Number.NaN, y: 0 },
        end: { x: 10, y: 10 },
      })
    ).toThrow(/must be finite/i);
  });

  it("creates valid rectangle topology", () => {
    const factory = new RectangleTopologyFactory(edgePointFactory);
    const topology = factory.create({
      id: "rect-1",
      x: 5,
      y: 10,
      width: 20,
      height: 12,
    });

    expect(topology.vertices).toHaveLength(4);
    expect(topology.edges).toHaveLength(4);
    expect(topology.vertices.map((v) => v.address.key)).toEqual([
      VertexAddressKeys.LeftTop,
      VertexAddressKeys.RightTop,
      VertexAddressKeys.RightBottom,
      VertexAddressKeys.LeftBottom,
    ]);
  });

  it("rejects invalid rectangle input", () => {
    const factory = new RectangleTopologyFactory(edgePointFactory);

    expect(() =>
      factory.create({ id: "", x: 0, y: 0, width: 10, height: 10 })
    ).toThrow(/must not be empty/i);

    expect(() =>
      factory.create({ id: "r", x: Number.NaN, y: 0, width: 10, height: 10 })
    ).toThrow(/origin must be finite/i);

    expect(() =>
      factory.create({ id: "r", x: 0, y: 0, width: 0, height: 10 })
    ).toThrow(/width must be greater than zero/i);

    expect(() =>
      factory.create({ id: "r", x: 0, y: 0, width: 10, height: 0 })
    ).toThrow(/height must be greater than zero/i);
  });

  it("creates valid polygon topology", () => {
    const factory = new PolygonTopologyFactory(edgePointFactory);
    const topology = factory.create({
      id: "poly-1",
      vertices: [
        { x: 0, y: 0 },
        { x: 10, y: 0 },
        { x: 10, y: 10 },
      ],
    });

    expect(topology.vertices).toHaveLength(3);
    expect(topology.edges).toHaveLength(3);
    expect(topology.edges[2]?.endVertexId).toBe(topology.vertices[0]?.id);
  });

  it("rejects invalid polygon input", () => {
    const factory = new PolygonTopologyFactory(edgePointFactory);

    expect(() =>
      factory.create({ id: "", vertices: [{ x: 0, y: 0 }, { x: 1, y: 1 }, { x: 2, y: 2 }] })
    ).toThrow(/must not be empty/i);

    expect(() =>
      factory.create({ id: "p", vertices: [{ x: 0, y: 0 }, { x: 1, y: 1 }] })
    ).toThrow(/at least 3/i);

    expect(() =>
      factory.create({
        id: "p",
        vertices: [
          { x: 0, y: 0 },
          { x: Number.POSITIVE_INFINITY, y: 1 },
          { x: 2, y: 2 },
        ],
      })
    ).toThrow(/must be finite/i);
  });

  it("creates valid polyline topology", () => {
    const factory = new PolylineTopologyFactory(edgePointFactory);
    const topology = factory.create({
      id: "pline-1",
      vertices: [
        { x: 0, y: 0 },
        { x: 5, y: 5 },
        { x: 10, y: 5 },
      ],
    });

    expect(topology.vertices).toHaveLength(3);
    expect(topology.edges).toHaveLength(2);
    expect(topology.edges[1]?.startVertexId).toBe(topology.vertices[1]?.id);
    expect(topology.edges[1]?.endVertexId).toBe(topology.vertices[2]?.id);
  });

  it("rejects invalid polyline input", () => {
    const factory = new PolylineTopologyFactory(edgePointFactory);

    expect(() =>
      factory.create({ id: "", vertices: [{ x: 0, y: 0 }, { x: 1, y: 1 }] })
    ).toThrow(/must not be empty/i);

    expect(() =>
      factory.create({ id: "pl", vertices: [{ x: 0, y: 0 }] })
    ).toThrow(/at least 2/i);

    expect(() =>
      factory.create({
        id: "pl",
        vertices: [
          { x: 0, y: 0 },
          { x: Number.NaN, y: 1 },
        ],
      })
    ).toThrow(/must be finite/i);
  });

  it("creates valid ellipse topology", () => {
    const factory = new EllipseTopologyFactory(edgePointFactory);
    const topology = factory.create({
      id: "ellipse-1",
      center: { x: 50, y: 25 },
      radiusX: 10,
      radiusY: 5,
    });

    expect(topology.vertices).toHaveLength(5);
    expect(topology.edges).toHaveLength(4);
    expect(topology.vertices.map((v) => v.address.key)).toEqual([
      VertexAddressKeys.Center,
      VertexAddressKeys.LeftCenter,
      VertexAddressKeys.TopCenter,
      VertexAddressKeys.RightCenter,
      VertexAddressKeys.BottomCenter,
    ]);
  });

  it("rejects invalid ellipse input", () => {
    const factory = new EllipseTopologyFactory(edgePointFactory);

    expect(() =>
      factory.create({
        id: "",
        center: { x: 0, y: 0 },
        radiusX: 1,
        radiusY: 1,
      })
    ).toThrow(/must not be empty/i);

    expect(() =>
      factory.create({
        id: "e",
        center: { x: Number.NaN, y: 0 },
        radiusX: 1,
        radiusY: 1,
      })
    ).toThrow(/center must be finite/i);

    expect(() =>
      factory.create({
        id: "e",
        center: { x: 0, y: 0 },
        radiusX: 0,
        radiusY: 1,
      })
    ).toThrow(/radiusX must be greater than zero/i);

    expect(() =>
      factory.create({
        id: "e",
        center: { x: 0, y: 0 },
        radiusX: 1,
        radiusY: 0,
      })
    ).toThrow(/radiusY must be greater than zero/i);
  });
});