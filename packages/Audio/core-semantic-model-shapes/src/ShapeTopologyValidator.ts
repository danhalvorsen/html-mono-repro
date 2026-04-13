import type { IPoint2D } from "@monorepo/core-semantic-model";

import { SemanticShapeValidationError } from "./SemanticShapeValidationError.js";
import type { IShape } from "./IShape.js";
import type { IShapeValidator } from "./IShapeValidator.js";
import type { ShapeEdge, ShapeVertex } from "./types.js";

export class ShapeTopologyValidator implements IShapeValidator<IShape> {
  public validate(shape: IShape): void {
    this.validateIdentifiers(shape);
    this.validateVertices(shape.topology.vertices);
    this.validateEdges(shape.topology.vertices, shape.topology.edges);
  }

  private validateIdentifiers(shape: IShape): void {
    if (shape.id.trim().length === 0) {
      throw new SemanticShapeValidationError("Shape id must not be empty.");
    }

    if (shape.kind.name.trim().length === 0) {
      throw new SemanticShapeValidationError("Shape kind name must not be empty.");
    }
  }

  private validateVertices(vertices: readonly ShapeVertex[]): void {
    const vertexIds = new Set<string>();

    for (const vertex of vertices) {
      if (vertex.id.trim().length === 0) {
        throw new SemanticShapeValidationError("Vertex id must not be empty.");
      }

      if (vertexIds.has(vertex.id)) {
        throw new SemanticShapeValidationError(`Duplicate vertex id '${vertex.id}'.`);
      }

      vertexIds.add(vertex.id);
      this.validatePoint(vertex.position, `Vertex '${vertex.id}' position`);
    }
  }

  private validateEdges(
    vertices: readonly ShapeVertex[],
    edges: readonly ShapeEdge[]
  ): void {
    const vertexIds = new Set(vertices.map((vertex) => vertex.id));
    const edgeIds = new Set<string>();

    for (const edge of edges) {
      if (edge.id.trim().length === 0) {
        throw new SemanticShapeValidationError("Edge id must not be empty.");
      }

      if (edgeIds.has(edge.id)) {
        throw new SemanticShapeValidationError(`Duplicate edge id '${edge.id}'.`);
      }

      edgeIds.add(edge.id);

      if (!vertexIds.has(edge.startVertexId)) {
        throw new SemanticShapeValidationError(
          `Edge '${edge.id}' references missing start vertex '${edge.startVertexId}'.`
        );
      }

      if (!vertexIds.has(edge.endVertexId)) {
        throw new SemanticShapeValidationError(
          `Edge '${edge.id}' references missing end vertex '${edge.endVertexId}'.`
        );
      }

      this.validateEdgePoints(edge);
    }
  }

  private validateEdgePoints(edge: ShapeEdge): void {
    let lastT = -Infinity;

    for (const point of edge.points) {
      if (point.t < 0 || point.t > 1) {
        throw new SemanticShapeValidationError(
          `Edge '${edge.id}' contains point with t outside [0,1].`
        );
      }

      if (point.t < lastT) {
        throw new SemanticShapeValidationError(
          `Edge '${edge.id}' contains edge points with non-monotonic t values.`
        );
      }

      lastT = point.t;
      this.validatePoint(point.position, `Edge '${edge.id}' point`);
    }
  }

  private validatePoint(point: IPoint2D, context: string): void {
    if (!Number.isFinite(point.x) || !Number.isFinite(point.y)) {
      throw new SemanticShapeValidationError(`${context} must be finite.`);
    }
  }
}