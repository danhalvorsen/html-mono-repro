// src/PolylineTopologyFactory.ts
import { EdgeAddressKeys } from "./EdgeAddressKeys.js";
import type { IEdgePointFactory } from "./IEdgePointFactory.js";
import type { IPolylineInput } from "./IPolylineInput.js";
import type { IShapeTopologyFactory } from "./IShapeTopologyFactory.js";
import { OrdinalVertexAddress } from "./OrdinalVertexAddress.js";
import { SemanticShapeValidationError } from "./SemanticShapeValidationError.js";
import { ShapeEdgeAddress } from "./ShapeEdgeAddress.js";
import type { ShapeEdge, ShapeTopology, ShapeVertex } from "./types.js";

export class PolylineTopologyFactory implements IShapeTopologyFactory<IPolylineInput> {
  public constructor(
    private readonly edgePointFactory: IEdgePointFactory
  ) {}

  public create(input: IPolylineInput): ShapeTopology {
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
      vertices.slice(0, -1).map((start: ShapeVertex, index: number): ShapeEdge => {
        const end = vertices[index + 1];

        if (!end) {
          throw new SemanticShapeValidationError(
            `Polyline edge '${input.id}:e:${index}' is missing its end vertex.`
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

  private validateInput(input: IPolylineInput): void {
    if (input.id.trim().length === 0) {
      throw new SemanticShapeValidationError("Polyline id must not be empty.");
    }

    if (input.vertices.length < 2) {
      throw new SemanticShapeValidationError("Polyline must contain at least 2 vertices.");
    }

    for (const vertex of input.vertices) {
      if (!Number.isFinite(vertex.x) || !Number.isFinite(vertex.y)) {
        throw new SemanticShapeValidationError("Polyline vertex must be finite.");
      }
    }
  }
}