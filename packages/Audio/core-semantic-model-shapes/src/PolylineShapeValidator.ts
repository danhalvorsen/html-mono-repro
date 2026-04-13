import { IPolylineShape } from "./IPolylineShape.js";
import { IShapeValidator } from "./IShapeValidator.js";
import { SemanticShapeValidationError } from "./SemanticShapeValidationError.js";
import { ShapeTopologyValidator } from "./ShapeTopologyValidator.js";

export class PolylineShapeValidator
  extends ShapeTopologyValidator
  implements IShapeValidator<IPolylineShape> {
  public override validate(shape: IPolylineShape): void {
    super.validate(shape);

    if (shape.topology.vertices.length < 2) {
      throw new SemanticShapeValidationError("Polyline must contain at least 2 vertices.");
    }

    if (shape.topology.edges.length !== shape.topology.vertices.length - 1) {
      throw new SemanticShapeValidationError(
        "Polyline must contain exactly one edge between consecutive vertices."
      );
    }
  }
}
