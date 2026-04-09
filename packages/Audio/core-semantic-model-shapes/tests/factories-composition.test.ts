import { describe, expect, it } from "vitest";
import {
  EllipseShapeFactory,
  EllipseShapeValidator,
  EllipseTopologyFactory,
  LineShapeFactory,
  LineShapeValidator,
  LineTopologyFactory,
  PolygonShapeFactory,
  PolygonShapeValidator,
  PolygonTopologyFactory,
  PolylineShapeFactory,
  PolylineShapeValidator,
  PolylineTopologyFactory,
  RectangleShapeFactory,
  RectangleShapeValidator,
  RectangleTopologyFactory,
  SemanticShapeKinds,
  SemanticShapesComposition,
  ShapeBuilder,
  ShapeEdgePointFactory,
} from "../src/index.js";
import { SAMPLE_PROPERTY, SAMPLE_RELATION } from "./fixtures/shapeFixtures.js";

describe("shape factories", () => {
  const edgePointFactory = new ShapeEdgePointFactory();
  const builder = new ShapeBuilder();

  it("creates line with and without optional fields", () => {
    const factory = new LineShapeFactory(
      new LineTopologyFactory(edgePointFactory),
      new LineShapeValidator(),
      builder
    );

    const bare = factory.create({
      id: "line-1",
      start: { x: 0, y: 0 },
      end: { x: 5, y: 0 },
    });

    const rich = factory.create({
      id: "line-2",
      start: { x: 0, y: 0 },
      end: { x: 5, y: 0 },
      properties: [SAMPLE_PROPERTY],
      relations: [SAMPLE_RELATION],
    });

    expect(bare.kind).toBe(SemanticShapeKinds.Line);
    expect(bare.properties).toEqual([]);
    expect(bare.relations).toEqual([]);
    expect(rich.properties).toEqual([SAMPLE_PROPERTY]);
    expect(rich.relations).toEqual([SAMPLE_RELATION]);
  });

  it("creates rectangle with and without optional fields", () => {
    const factory = new RectangleShapeFactory(
      new RectangleTopologyFactory(edgePointFactory),
      new RectangleShapeValidator(),
      builder
    );

    const bare = factory.create({ id: "rect-1", x: 1, y: 2, width: 3, height: 4 });
    const rich = factory.create({
      id: "rect-2",
      x: 1,
      y: 2,
      width: 3,
      height: 4,
      properties: [SAMPLE_PROPERTY],
      relations: [SAMPLE_RELATION],
    });

    expect(bare.kind).toBe(SemanticShapeKinds.Rectangle);
    expect(bare.properties).toEqual([]);
    expect(rich.properties).toEqual([SAMPLE_PROPERTY]);
    expect(rich.relations).toEqual([SAMPLE_RELATION]);
  });

  it("creates polygon with and without optional fields", () => {
    const factory = new PolygonShapeFactory(
      new PolygonTopologyFactory(edgePointFactory),
      new PolygonShapeValidator(),
      builder
    );

    const vertices = [
      { x: 0, y: 0 },
      { x: 10, y: 0 },
      { x: 10, y: 10 },
    ] as const;

    const bare = factory.create({ id: "poly-1", vertices });
    const rich = factory.create({
      id: "poly-2",
      vertices,
      properties: [SAMPLE_PROPERTY],
      relations: [SAMPLE_RELATION],
    });

    expect(bare.kind).toBe(SemanticShapeKinds.Polygon);
    expect(bare.properties).toEqual([]);
    expect(rich.properties).toEqual([SAMPLE_PROPERTY]);
    expect(rich.relations).toEqual([SAMPLE_RELATION]);
  });

  it("creates polyline with and without optional fields", () => {
    const factory = new PolylineShapeFactory(
      new PolylineTopologyFactory(edgePointFactory),
      new PolylineShapeValidator(),
      builder
    );

    const vertices = [
      { x: 0, y: 0 },
      { x: 10, y: 0 },
      { x: 10, y: 10 },
    ] as const;

    const bare = factory.create({ id: "pline-1", vertices });
    const rich = factory.create({
      id: "pline-2",
      vertices,
      properties: [SAMPLE_PROPERTY],
      relations: [SAMPLE_RELATION],
    });

    expect(bare.kind).toBe(SemanticShapeKinds.Polyline);
    expect(bare.properties).toEqual([]);
    expect(rich.properties).toEqual([SAMPLE_PROPERTY]);
    expect(rich.relations).toEqual([SAMPLE_RELATION]);
  });

  it("creates ellipse with and without optional fields", () => {
    const factory = new EllipseShapeFactory(
      new EllipseTopologyFactory(edgePointFactory),
      new EllipseShapeValidator(),
      builder
    );

    const bare = factory.create({
      id: "ellipse-1",
      center: { x: 0, y: 0 },
      radiusX: 10,
      radiusY: 5,
    });

    const rich = factory.create({
      id: "ellipse-2",
      center: { x: 0, y: 0 },
      radiusX: 10,
      radiusY: 5,
      properties: [SAMPLE_PROPERTY],
      relations: [SAMPLE_RELATION],
    });

    expect(bare.kind).toBe(SemanticShapeKinds.Ellipse);
    expect(bare.properties).toEqual([]);
    expect(rich.properties).toEqual([SAMPLE_PROPERTY]);
    expect(rich.relations).toEqual([SAMPLE_RELATION]);
  });
});

describe("semantic shapes composition", () => {
  it("wires all factories and creates each shape type", () => {
    const composition = new SemanticShapesComposition();

    expect(composition.edgePointFactory).toBeDefined();
    expect(composition.shapeBuilder).toBeDefined();

    const rectangle = composition.rectangleFactory.create({
      id: "rect",
      x: 0,
      y: 0,
      width: 10,
      height: 10,
    });

    const polygon = composition.polygonFactory.create({
      id: "poly",
      vertices: [
        { x: 0, y: 0 },
        { x: 10, y: 0 },
        { x: 10, y: 10 },
      ],
    });

    const polyline = composition.polylineFactory.create({
      id: "pline",
      vertices: [
        { x: 0, y: 0 },
        { x: 10, y: 0 },
      ],
    });

    const line = composition.lineFactory.create({
      id: "line",
      start: { x: 0, y: 0 },
      end: { x: 1, y: 1 },
    });

    const ellipse = composition.ellipseFactory.create({
      id: "ellipse",
      center: { x: 0, y: 0 },
      radiusX: 10,
      radiusY: 4,
    });

    expect(rectangle.kind).toBe(SemanticShapeKinds.Rectangle);
    expect(polygon.kind).toBe(SemanticShapeKinds.Polygon);
    expect(polyline.kind).toBe(SemanticShapeKinds.Polyline);
    expect(line.kind).toBe(SemanticShapeKinds.Line);
    expect(ellipse.kind).toBe(SemanticShapeKinds.Ellipse);
  });
});