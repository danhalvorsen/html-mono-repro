import { SemanticShapeValidationError } from "./SemanticShapeValidationError.js";
import { ShapeTopologyValidator } from "./ShapeTopologyValidator.js";

import type { IShapeValidator } from "./IShapeValidator.js";
import type { ILineShape } from "./ILineShape.js";

export class LineShapeValidator
  extends ShapeTopologyValidator
  implements IShapeValidator<ILineShape> {
  public override validate(shape: ILineShape): void {
    super.validate(shape);

    if (shape.topology.vertices.length !== 2) {
      throw new SemanticShapeValidationError("Line must contain exactly 2 vertices.");
    }

    if (shape.topology.edges.length !== 1) {
      throw new SemanticShapeValidationError("Line must contain exactly 1 edge.");
    }
  }
}

