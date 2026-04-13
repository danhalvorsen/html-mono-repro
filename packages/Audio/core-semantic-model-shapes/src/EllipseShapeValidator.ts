import { VertexAddressKeys } from "./types.js";
import type { IEllipseShape } from "./IEllipseShape.js";
import type { IShapeValidator } from "./IShapeValidator.js";
import { SemanticShapeValidationError } from "./SemanticShapeValidationError.js";
import { ShapeTopologyValidator } from "./ShapeTopologyValidator.js";

type EllipseVertex = Readonly<{
  address: Readonly<{ key: string }>;
}>;

type EllipseTopology = Readonly<{
  vertices: readonly EllipseVertex[];
}>;

type EllipseShapeWithTopology = IEllipseShape & Readonly<{
  topology: EllipseTopology;
}>;

export class EllipseShapeValidator
  extends ShapeTopologyValidator
  implements IShapeValidator<IEllipseShape> {
  public override validate(shape: IEllipseShape): void {
    super.validate(shape);

    const ellipse = shape as EllipseShapeWithTopology;

    if (ellipse.topology.vertices.length < 5) {
      throw new SemanticShapeValidationError(
        "Ellipse semantic model must expose at least 5 vertices."
      );
    }

    const vertexKeys = new Set(ellipse.topology.vertices.map((vertex) => vertex.address.key));

    for (const required of [
      VertexAddressKeys.Center,
      VertexAddressKeys.LeftCenter,
      VertexAddressKeys.TopCenter,
      VertexAddressKeys.RightCenter,
      VertexAddressKeys.BottomCenter,
    ]) {
      if (!vertexKeys.has(required)) {
        throw new SemanticShapeValidationError(
          `Ellipse is missing vertex address '${required}'.`
        );
      }
    }
  }
}
