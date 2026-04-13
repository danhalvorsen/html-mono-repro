// packages/Audio/core-semantic-model-shapes/src/PolygonTopologyFactory.ts
import { EdgeAddressKeys } from "./EdgeAddressKeys.js";
import type { IPolygonInput } from "./IPolygonInput.js";
import type { IShapeTopologyFactory } from "./IShapeTopologyFactory.js";
import type { ShapeEdge, ShapeTopology, ShapeVertex } from "./types.js";
import type { IEdgePointFactory } from "./IEdgePointFactory.js";
import { OrdinalVertexAddress } from "./OrdinalVertexAddress.js";
import { SemanticShapeValidationError } from "./SemanticShapeValidationError.js";
import { ShapeEdgeAddress } from "./ShapeEdgeAddress.js";

export class PolygonTopologyFactory implements IShapeTopologyFactory<IPolygonInput> {
  public constructor(
    private readonly edgePointFactory: IEdgePointFactory
  ) {}

  public create(input: IPolygonInput): ShapeTopology {
    this.validateInput(input);

    const vertices = Object.freeze(
      input.vertices.map((point, index): ShapeVertex =>
        Object.freeze<ShapeVertex>({
          id: `${input.id}:v:${index}`,
          address: new OrdinalVertexAddress(index),
          position: Object.freeze({
            x: point.x,
            y: point.y,
          }),
        })
      )
    );

    const edges = Object.freeze(
      vertices.map((start: ShapeVertex, index: number): ShapeEdge => {
        const end = vertices[(index + 1) % vertices.length];

        if (!end) {
          throw new SemanticShapeValidationError(
            `Polygon edge '${input.id}:e:${index}' is missing its end vertex.`
          );
        }

        return Object.freeze<ShapeEdge>({
          id: `${input.id}:e:${index}`,
          address: new ShapeEdgeAddress(EdgeAddressKeys.Boundary),
          startVertexId: start.id,
          endVertexId: end.id,
          points: this.edgePointFactory.createPoints(start.position, end.position),
        });
      })
    );

    return Object.freeze({
      vertices,
      edges,
    });
  }

  private validateInput(input: IPolygonInput): void {
    if (input.id.trim().length === 0) {
      throw new SemanticShapeValidationError("Polygon id must not be empty.");
    }

    if (input.vertices.length < 3) {
      throw new SemanticShapeValidationError("Polygon must contain at least 3 vertices.");
    }

    for (const vertex of input.vertices) {
      if (!Number.isFinite(vertex.x) || !Number.isFinite(vertex.y)) {
        throw new SemanticShapeValidationError("Polygon vertex must be finite.");
      }
    }
  }
}