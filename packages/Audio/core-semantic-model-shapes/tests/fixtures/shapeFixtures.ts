import type {
  IPoint2D,
  ISemanticRelation,
  ISemanticProperty,
} from "@monorepo/core-semantic-model";
import {
  ShapeEdgeAddress,
  ShapeEdgePointAddress,
  ShapeVertexAddress,
  SemanticShapeKind,
} from "../../src/index.js";
import type { Shape, ShapeEdge, ShapeEdgePoint, ShapeVertex } from "../../src/index.js";

export const SAMPLE_PROPERTY: ISemanticProperty = Object.freeze({
  key: "color",
  value: "red",
});

export const SAMPLE_RELATION: ISemanticRelation = Object.freeze({
  type: "related-to",
  targetShapeId: "shape:target",
});

export function createPoint(x = 10, y = 20): IPoint2D {
  return Object.freeze({ x, y });
}

export function createEdgePoints(
  start: IPoint2D,
  end: IPoint2D
): readonly ShapeEdgePoint[] {
  return Object.freeze([
    Object.freeze({
      address: new ShapeEdgePointAddress("Start"),
      t: 0,
      position: Object.freeze({ x: start.x, y: start.y }),
    }),
    Object.freeze({
      address: new ShapeEdgePointAddress("End"),
      t: 1,
      position: Object.freeze({ x: end.x, y: end.y }),
    }),
  ]);
}

export function createVertex(
  id: string,
  key: string,
  x: number,
  y: number
): ShapeVertex {
  return Object.freeze({
    id,
    address: new ShapeVertexAddress(key as never),
    position: Object.freeze({ x, y }),
  }) as ShapeVertex;
}

export function createEdge(
  id: string,
  key: string,
  startVertexId: string,
  endVertexId: string,
  start: IPoint2D,
  end: IPoint2D,
  tValues: readonly number[] = [0, 1]
): ShapeEdge {
  const points = Object.freeze(
    tValues.map((t) =>
      Object.freeze({
        address: new ShapeEdgePointAddress(
          t === 0 ? "Start" : t === 1 ? "End" : "Midpoint"
        ),
        t,
        position: Object.freeze({
          x: start.x + (end.x - start.x) * t,
          y: start.y + (end.y - start.y) * t,
        }),
      })
    )
  );

  return Object.freeze({
    id,
    address: new ShapeEdgeAddress(key as never),
    startVertexId,
    endVertexId,
    points,
  }) as ShapeEdge;
}

export function createShape(overrides?: {
  id?: string;
  kindName?: string;
  vertices?: readonly ShapeVertex[];
  edges?: readonly ShapeEdge[];
  properties?: readonly ISemanticProperty[];
  relations?: readonly ISemanticRelation[];
}): Shape {
  const p1 = createPoint(0, 0);
  const p2 = createPoint(10, 0);

  const vertices =
    overrides?.vertices ??
    Object.freeze([
      createVertex("v0", "LeftTop", p1.x, p1.y),
      createVertex("v1", "RightTop", p2.x, p2.y),
    ]);

  const edges =
    overrides?.edges ??
    Object.freeze([
      createEdge("e0", "Boundary", "v0", "v1", p1, p2),
    ]);

  return Object.freeze({
    id: overrides?.id ?? "shape:1",
    kind: new SemanticShapeKind((overrides?.kindName ?? "Line") as never),
    topology: Object.freeze({ vertices, edges }),
    properties: Object.freeze(overrides?.properties ?? []),
    relations: Object.freeze(overrides?.relations ?? []),
  }) as Shape;
}

export function getSourceModuleSpecifiers(): readonly string[] {
  return [
    "../src/EdgeAddressKeys.js",
    "../src/EllipseShapeFactory.js",
    "../src/EllipseShapeValidator.js",
    "../src/EllipseTopologyFactory.js",
    "../src/IEdgePointFactory.js",
    "../src/IEllipseInput.js",
    "../src/IEllipseShape.js",
    "../src/ILineInput.js",
    "../src/ILineShape.js",
    "../src/IPolygonInput.js",
    "../src/IPolygonShape.js",
    "../src/IPolylineInput.js",
    "../src/IPolylineShape.js",
    "../src/IRectangleInput.js",
    "../src/IRectangleShape.js",
    "../src/IShape.js",
    "../src/IShapeDefinition.js",
    "../src/IShapeEdgeDefinition.js",
    "../src/IShapeFactory.js",
    "../src/IShapeTopologyDefinition.js",
    "../src/IShapeTopologyFactory.js",
    "../src/IShapeValidator.js",
    "../src/IShapeVertexDefinition.js",
    "../src/LineShapeFactory.js",
    "../src/LineShapeValidator.js",
    "../src/LineTopologyFactory.js",
    "../src/OrdinalVertexAddress.js",
    "../src/PolygonShapeFactory.js",
    "../src/PolygonShapeValidator.js",
    "../src/PolygonTopologyFactory.js",
    "../src/PolylineShapeFactory.js",
    "../src/PolylineShapeValidator.js",
    "../src/PolylineTopologyFactory.js",
    "../src/RectangleShapeFactory.js",
    "../src/RectangleShapeValidator.js",
    "../src/RectangleTopologyFactory.js",
    "../src/SemanticShapeKind.js",
    "../src/SemanticShapeValidationError.js",
    "../src/Shape.js",
    "../src/ShapeBuilder.js",
    "../src/ShapeEdgeAddress.js",
    "../src/ShapeEdgePointAddress.js",
    "../src/ShapeEdgePointFactory.js",
    "../src/ShapeTopologyValidator.js",
    "../src/ShapeVertexAddress.js",
    "../src/addresses.js",
    "../src/builders.js",
    "../src/composition.js",
    "../src/contracts.js",
    "../src/errors.js",
    "../src/index.js",
    "../src/kinds.js",
    "../src/types.js",
  ] as const;
}