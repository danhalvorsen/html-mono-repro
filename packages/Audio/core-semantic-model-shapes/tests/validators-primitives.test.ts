import { describe, expect, it } from "vitest";
import {
  EllipseShapeValidator,
  LineShapeValidator,
  OrdinalVertexAddress,
  PolygonShapeValidator,
  PolylineShapeValidator,
  RectangleShapeValidator,
  SemanticShapeKind,
  SemanticShapeValidationError,
  ShapeBuilder,
  ShapeEdgeAddress,
  ShapeEdgePointAddress,
  ShapeEdgePointFactory,
  ShapeTopologyValidator,
  ShapeVertexAddress,
  VertexAddressKeys,
} from "../src/index.js";
import {
  SAMPLE_PROPERTY,
  SAMPLE_RELATION,
  createEdge,
  createPoint,
  createShape,
  createVertex,
  getSourceModuleSpecifiers,
} from "./fixtures/shapeFixtures.js";

describe("primitives", () => {
  it("constructs address and kind primitives", () => {
    const vertexAddress = new ShapeVertexAddress(VertexAddressKeys.Center);
    const edgeAddress = new ShapeEdgeAddress("Boundary");
    const edgePointAddress = new ShapeEdgePointAddress("Midpoint");
    const kind = new SemanticShapeKind("Rectangle");

    expect(vertexAddress.domain).toBe("shape.vertex");
    expect(edgeAddress.domain).toBe("shape.edge");
    expect(edgePointAddress.domain).toBe("shape.edge-point");
    expect(kind.name).toBe("Rectangle");
  });

  it("creates and rejects ordinal vertex addresses", () => {
    const address = new OrdinalVertexAddress(2);

    expect(address.domain).toBe("shape.vertex");
    expect(address.key).toBe("Vertex[2]");

    expect(() => new OrdinalVertexAddress(-1)).toThrow(/non-negative integer/i);
    expect(() => new OrdinalVertexAddress(1.1)).toThrow(/non-negative integer/i);
  });

  it("creates edge subdivision points", () => {
    const factory = new ShapeEdgePointFactory();
    const points = factory.createPoints({ x: 0, y: 4 }, { x: 10, y: 8 });

    expect(points).toHaveLength(3);
    expect(points[0]?.t).toBe(0);
    expect(points[1]?.t).toBe(0.5);
    expect(points[1]?.position).toEqual({ x: 5, y: 6 });
    expect(points[2]?.t).toBe(1);
  });

  it("creates semantic validation errors", () => {
    const error = new SemanticShapeValidationError("boom");
    expect(error.name).toBe("SemanticShapeValidationError");
    expect(error.message).toBe("boom");
  });
});

describe("shape builder", () => {
  it("creates immutable shape with default arrays", () => {
    const builder = new ShapeBuilder();
    const shape = builder.create({
      id: "shape-a",
      kind: new SemanticShapeKind("Line"),
      topology: {
        vertices: [createVertex("v0", "LeftCenter", 0, 0), createVertex("v1", "RightCenter", 10, 0)],
        edges: [createEdge("e0", "Boundary", "v0", "v1", createPoint(0, 0), createPoint(10, 0))],
      },
    });

    expect(shape.properties).toEqual([]);
    expect(shape.relations).toEqual([]);
    expect(Object.isFrozen(shape)).toBe(true);
    expect(Object.isFrozen(shape.topology.vertices)).toBe(true);
    expect(Object.isFrozen(shape.topology.edges)).toBe(true);
  });

  it("keeps provided properties and relations", () => {
    const builder = new ShapeBuilder();
    const shape = builder.create({
      id: "shape-b",
      kind: new SemanticShapeKind("Rectangle"),
      topology: {
        vertices: [createVertex("v0", "LeftTop", 0, 0), createVertex("v1", "RightTop", 1, 0)],
        edges: [createEdge("e0", "Top", "v0", "v1", createPoint(0, 0), createPoint(1, 0))],
      },
      properties: [SAMPLE_PROPERTY],
      relations: [SAMPLE_RELATION],
    });

    expect(shape.properties).toEqual([SAMPLE_PROPERTY]);
    expect(shape.relations).toEqual([SAMPLE_RELATION]);
  });
});

describe("shape topology validator", () => {
  it("validates a well-formed shape", () => {
    const validator = new ShapeTopologyValidator();
    expect(() => validator.validate(createShape())).not.toThrow();
  });

  it("rejects empty shape id", () => {
    const validator = new ShapeTopologyValidator();
    expect(() => validator.validate(createShape({ id: " " }))).toThrow(/shape id/i);
  });

  it("rejects empty kind name", () => {
    const validator = new ShapeTopologyValidator();
    expect(() => validator.validate(createShape({ kindName: " " }))).toThrow(/kind name/i);
  });

  it("rejects empty and duplicate vertex ids", () => {
    const validator = new ShapeTopologyValidator();
    const p = createPoint(0, 0);
    expect(() =>
      validator.validate(
        createShape({ vertices: [createVertex(" ", "Center", p.x, p.y), createVertex("v1", "Right", 1, 1)] })
      )
    ).toThrow(/vertex id must not be empty/i);

    expect(() =>
      validator.validate(
        createShape({
          vertices: [createVertex("dup", "Center", 0, 0), createVertex("dup", "Right", 1, 1)],
          edges: [createEdge("e0", "Boundary", "dup", "dup", createPoint(0, 0), createPoint(1, 1))],
        })
      )
    ).toThrow(/duplicate vertex id/i);
  });

  it("rejects non-finite vertex position", () => {
    const validator = new ShapeTopologyValidator();
    expect(() =>
      validator.validate(
        createShape({
          vertices: [
            createVertex("v0", "LeftTop", Number.NaN, 0),
            createVertex("v1", "RightTop", 1, 1),
          ],
        })
      )
    ).toThrow(/must be finite/i);
  });

  it("rejects empty and duplicate edge ids", () => {
    const validator = new ShapeTopologyValidator();
    const vertices = [createVertex("v0", "A", 0, 0), createVertex("v1", "B", 1, 1)] as const;

    expect(() =>
      validator.validate(
        createShape({
          vertices,
          edges: [createEdge(" ", "Boundary", "v0", "v1", createPoint(0, 0), createPoint(1, 1))],
        })
      )
    ).toThrow(/edge id must not be empty/i);

    expect(() =>
      validator.validate(
        createShape({
          vertices,
          edges: [
            createEdge("dup", "Boundary", "v0", "v1", createPoint(0, 0), createPoint(1, 1)),
            createEdge("dup", "Boundary", "v1", "v0", createPoint(1, 1), createPoint(0, 0)),
          ],
        })
      )
    ).toThrow(/duplicate edge id/i);
  });

  it("rejects missing start and end vertex references", () => {
    const validator = new ShapeTopologyValidator();
    const vertices = [createVertex("v0", "A", 0, 0), createVertex("v1", "B", 1, 1)] as const;

    expect(() =>
      validator.validate(
        createShape({
          vertices,
          edges: [createEdge("e0", "Boundary", "missing", "v1", createPoint(0, 0), createPoint(1, 1))],
        })
      )
    ).toThrow(/missing start vertex/i);

    expect(() =>
      validator.validate(
        createShape({
          vertices,
          edges: [createEdge("e0", "Boundary", "v0", "missing", createPoint(0, 0), createPoint(1, 1))],
        })
      )
    ).toThrow(/missing end vertex/i);
  });

  it("rejects out-of-range and non-monotonic edge t values", () => {
    const validator = new ShapeTopologyValidator();
    const vertices = [createVertex("v0", "A", 0, 0), createVertex("v1", "B", 1, 1)] as const;

    expect(() =>
      validator.validate(
        createShape({
          vertices,
          edges: [createEdge("e0", "Boundary", "v0", "v1", createPoint(0, 0), createPoint(1, 1), [0, 1.2])],
        })
      )
    ).toThrow(/outside \[0,1\]/i);

    expect(() =>
      validator.validate(
        createShape({
          vertices,
          edges: [createEdge("e0", "Boundary", "v0", "v1", createPoint(0, 0), createPoint(1, 1), [0.8, 0.2])],
        })
      )
    ).toThrow(/non-monotonic/i);
  });

  it("rejects non-finite edge point positions", () => {
    const validator = new ShapeTopologyValidator();
    const vertices = [createVertex("v0", "A", 0, 0), createVertex("v1", "B", 1, 1)] as const;
    const edge = Object.freeze({
      id: "e0",
      address: new ShapeEdgeAddress("Boundary"),
      startVertexId: "v0",
      endVertexId: "v1",
      points: Object.freeze([
        Object.freeze({
          address: new ShapeEdgePointAddress("Start"),
          t: 0,
          position: Object.freeze({ x: Number.NaN, y: 0 }),
        }),
      ]),
    });

    expect(() => validator.validate(createShape({ vertices, edges: [edge] }))).toThrow(/must be finite/i);
  });
});

describe("specialized validators", () => {
  it("validates and rejects line shapes", () => {
    const validator = new LineShapeValidator();
    expect(() => validator.validate(createShape())).not.toThrow();

    expect(() =>
      validator.validate(
        createShape({
          vertices: [
            createVertex("v0", "A", 0, 0),
            createVertex("v1", "B", 1, 1),
            createVertex("v2", "C", 2, 2),
          ],
        })
      )
    ).toThrow(/exactly 2 vertices/i);

    expect(() =>
      validator.validate(
        createShape({
          edges: [
            createEdge("e0", "Boundary", "v0", "v1", createPoint(0, 0), createPoint(1, 1)),
            createEdge("e1", "Boundary", "v1", "v0", createPoint(1, 1), createPoint(0, 0)),
          ],
        })
      )
    ).toThrow(/exactly 1 edge/i);
  });

  it("validates and rejects polyline shapes", () => {
    const validator = new PolylineShapeValidator();

    const validShape = createShape({
      vertices: [
        createVertex("v0", "A", 0, 0),
        createVertex("v1", "B", 1, 1),
        createVertex("v2", "C", 2, 2),
      ],
      edges: [
        createEdge("e0", "Boundary", "v0", "v1", createPoint(0, 0), createPoint(1, 1)),
        createEdge("e1", "Boundary", "v1", "v2", createPoint(1, 1), createPoint(2, 2)),
      ],
    });

    expect(() => validator.validate(validShape)).not.toThrow();

    expect(() => validator.validate(createShape({ vertices: [createVertex("v0", "A", 0, 0)] }))).toThrow(
      /at least 2 vertices/i
    );

    expect(() =>
      validator.validate(
        createShape({
          vertices: [createVertex("v0", "A", 0, 0), createVertex("v1", "B", 1, 1)],
          edges: [
            createEdge("e0", "Boundary", "v0", "v1", createPoint(0, 0), createPoint(1, 1)),
            createEdge("e1", "Boundary", "v1", "v0", createPoint(1, 1), createPoint(0, 0)),
          ],
        })
      )
    ).toThrow(/exactly one edge between consecutive vertices/i);
  });

  it("validates and rejects polygon shapes", () => {
    const validator = new PolygonShapeValidator();

    const vertices = [
      createVertex("v0", "A", 0, 0),
      createVertex("v1", "B", 1, 0),
      createVertex("v2", "C", 1, 1),
    ] as const;

    const closedEdges = [
      createEdge("e0", "Boundary", "v0", "v1", createPoint(0, 0), createPoint(1, 0)),
      createEdge("e1", "Boundary", "v1", "v2", createPoint(1, 0), createPoint(1, 1)),
      createEdge("e2", "Boundary", "v2", "v0", createPoint(1, 1), createPoint(0, 0)),
    ] as const;

    expect(() => validator.validate(createShape({ vertices, edges: closedEdges }))).not.toThrow();

    expect(() => validator.validate(createShape({ vertices: vertices.slice(0, 2) }))).toThrow(/at least 3 vertices/i);

    expect(() =>
      validator.validate(createShape({ vertices, edges: closedEdges.slice(0, 2) }))
    ).toThrow(/exactly one edge per vertex/i);

    expect(() =>
      validator.validate(
        createShape({
          vertices,
          edges: [
            createEdge("e0", "Boundary", "v0", "v1", createPoint(0, 0), createPoint(1, 0)),
            createEdge("e1", "Boundary", "v0", "v2", createPoint(0, 0), createPoint(1, 1)),
            createEdge("e2", "Boundary", "v2", "v0", createPoint(1, 1), createPoint(0, 0)),
          ],
        })
      )
    ).toThrow(/out-degree 1/i);

    expect(() =>
      validator.validate(
        createShape({
          vertices,
          edges: [
            createEdge("e0", "Boundary", "v0", "v1", createPoint(0, 0), createPoint(1, 0)),
            createEdge("e1", "Boundary", "v1", "v1", createPoint(1, 0), createPoint(1, 0)),
            createEdge("e2", "Boundary", "v2", "v0", createPoint(1, 1), createPoint(0, 0)),
          ],
        })
      )
    ).toThrow(/in-degree 1/i);
  });

  it("validates and rejects rectangle shapes", () => {
    const validator = new RectangleShapeValidator();

    const vertices = [
      createVertex("v0", "LeftTop", 0, 0),
      createVertex("v1", "RightTop", 1, 0),
      createVertex("v2", "RightBottom", 1, 1),
      createVertex("v3", "LeftBottom", 0, 1),
    ] as const;

    const edges = [
      createEdge("e0", "Top", "v0", "v1", createPoint(0, 0), createPoint(1, 0)),
      createEdge("e1", "Right", "v1", "v2", createPoint(1, 0), createPoint(1, 1)),
      createEdge("e2", "Bottom", "v2", "v3", createPoint(1, 1), createPoint(0, 1)),
      createEdge("e3", "Left", "v3", "v0", createPoint(0, 1), createPoint(0, 0)),
    ] as const;

    expect(() => validator.validate(createShape({ kindName: "Rectangle", vertices, edges }))).not.toThrow();

    expect(() => validator.validate(createShape({ kindName: "Rectangle", vertices: vertices.slice(0, 3), edges }))).toThrow(
      /exactly 4 vertices/i
    );

    expect(() => validator.validate(createShape({ kindName: "Rectangle", vertices, edges: edges.slice(0, 3) }))).toThrow(
      /exactly 4 edges/i
    );

    expect(() =>
      validator.validate(
        createShape({
          kindName: "Rectangle",
          vertices: [
            createVertex("v0", "LeftTop", 0, 0),
            createVertex("v1", "RightTop", 1, 0),
            createVertex("v2", "RightBottom", 1, 1),
            createVertex("v3", "Wrong", 0, 1),
          ],
          edges,
        })
      )
    ).toThrow(/vertex addresses/i);

    expect(() =>
      validator.validate(
        createShape({
          kindName: "Rectangle",
          vertices,
          edges: [
            createEdge("e0", "Top", "v0", "v1", createPoint(0, 0), createPoint(1, 0)),
            createEdge("e1", "Right", "v1", "v2", createPoint(1, 0), createPoint(1, 1)),
            createEdge("e2", "Bottom", "v2", "v3", createPoint(1, 1), createPoint(0, 1)),
            createEdge("e3", "Wrong", "v3", "v0", createPoint(0, 1), createPoint(0, 0)),
          ],
        })
      )
    ).toThrow(/edge addresses/i);
  });

  it("validates and rejects ellipse shapes", () => {
    const validator = new EllipseShapeValidator();

    const validVertices = [
      createVertex("v0", "Center", 0, 0),
      createVertex("v1", "LeftCenter", -1, 0),
      createVertex("v2", "TopCenter", 0, -1),
      createVertex("v3", "RightCenter", 1, 0),
      createVertex("v4", "BottomCenter", 0, 1),
    ] as const;

    const validEdges = [
      createEdge("e0", "Boundary", "v1", "v2", createPoint(-1, 0), createPoint(0, -1)),
      createEdge("e1", "Boundary", "v2", "v3", createPoint(0, -1), createPoint(1, 0)),
      createEdge("e2", "Boundary", "v3", "v4", createPoint(1, 0), createPoint(0, 1)),
      createEdge("e3", "Boundary", "v4", "v1", createPoint(0, 1), createPoint(-1, 0)),
    ] as const;

    expect(() => validator.validate(createShape({ kindName: "Ellipse", vertices: validVertices, edges: validEdges }))).not.toThrow();

    expect(() =>
      validator.validate(createShape({ kindName: "Ellipse", vertices: validVertices.slice(0, 4), edges: validEdges }))
    ).toThrow(/at least 5 vertices/i);

    expect(() =>
      validator.validate(
        createShape({
          kindName: "Ellipse",
          vertices: [
            createVertex("v0", "Center", 0, 0),
            createVertex("v1", "LeftCenter", -1, 0),
            createVertex("v2", "TopCenter", 0, -1),
            createVertex("v3", "RightCenter", 1, 0),
            createVertex("v4", "Wrong", 0, 1),
          ],
          edges: validEdges,
        })
      )
    ).toThrow(/missing vertex address/i);
  });
});

describe("module loading", () => {
  it("loads every source module", async () => {
    const modules = getSourceModuleSpecifiers();
    const loaded = await Promise.all(modules.map(async (specifier) => import(specifier)));

    expect(loaded).toHaveLength(modules.length);
    expect(loaded.every((moduleValue) => moduleValue !== null)).toBe(true);
  });
});