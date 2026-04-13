import { SemanticShapeValidationError } from "./SemanticShapeValidationError.js";
import { ShapeTopologyValidator } from "./ShapeTopologyValidator.js";

import type { IShapeValidator } from "./IShapeValidator.js";
import type { IPolygonShape } from "./IPolygonShape.js";
import type { ShapeTopology } from "./types.js";

export class PolygonShapeValidator
  extends ShapeTopologyValidator
  implements IShapeValidator<IPolygonShape> {

  public override validate(shape: IPolygonShape): void {
    super.validate(shape);

    if (shape.topology.vertices.length < 3) {
      throw new SemanticShapeValidationError(
        "Polygon must contain at least 3 vertices."
      );
    }

    if (shape.topology.edges.length !== shape.topology.vertices.length) {
      throw new SemanticShapeValidationError(
        "Polygon must contain exactly one edge per vertex."
      );
    }

    this.validateClosedLoop(shape.topology);
  }

  protected validateClosedLoop(topology: ShapeTopology): void {
    const outDegree = new Map<string, number>();
    const inDegree = new Map<string, number>();

    for (const vertex of topology.vertices) {
      outDegree.set(vertex.id, 0);
      inDegree.set(vertex.id, 0);
    }

    for (const edge of topology.edges) {
      outDegree.set(
        edge.startVertexId,
        (outDegree.get(edge.startVertexId) ?? 0) + 1
      );
      inDegree.set(
        edge.endVertexId,
        (inDegree.get(edge.endVertexId) ?? 0) + 1
      );
    }

    for (const vertex of topology.vertices) {
      if ((outDegree.get(vertex.id) ?? 0) !== 1) {
        throw new SemanticShapeValidationError(
          `Polygon vertex '${vertex.id}' must have out-degree 1.`
        );
      }

      if ((inDegree.get(vertex.id) ?? 0) !== 1) {
        throw new SemanticShapeValidationError(
          `Polygon vertex '${vertex.id}' must have in-degree 1.`
        );
      }
    }
  }
}