// src/RectangleShapeValidator.ts
import { EdgeAddressKeys } from "./EdgeAddressKeys.js";
import type { IRectangleShape } from "./IRectangleShape.js";
import type { IShapeValidator } from "./IShapeValidator.js";
import { VertexAddressKeys } from "./types.js";
import { PolygonShapeValidator } from "./PolygonShapeValidator.js";
import { SemanticShapeValidationError } from "./SemanticShapeValidationError.js";

export class RectangleShapeValidator
  extends PolygonShapeValidator
  implements IShapeValidator<IRectangleShape> {
  public override validate(shape: IRectangleShape): void {
    super.validate(shape);

    if (shape.topology.vertices.length !== 4) {
      throw new SemanticShapeValidationError("Rectangle must contain exactly 4 vertices.");
    }

    if (shape.topology.edges.length !== 4) {
      throw new SemanticShapeValidationError("Rectangle must contain exactly 4 edges.");
    }

    const vertexKeys = new Set<string>(
      shape.topology.vertices.map((vertex) => vertex.address.key)
    );

    this.assertContainsExactly(vertexKeys, [
      VertexAddressKeys.LeftTop,
      VertexAddressKeys.RightTop,
      VertexAddressKeys.RightBottom,
      VertexAddressKeys.LeftBottom,
    ], "Rectangle vertex addresses");

    const edgeKeys = new Set<string>(
      shape.topology.edges.map((edge) => edge.address.key)
    );

    this.assertContainsExactly(edgeKeys, [
      EdgeAddressKeys.Top,
      EdgeAddressKeys.Right,
      EdgeAddressKeys.Bottom,
      EdgeAddressKeys.Left,
    ], "Rectangle edge addresses");
  }

  private assertContainsExactly(
    actual: ReadonlySet<string>,
    expected: readonly string[],
    context: string
  ): void {
    if (actual.size !== expected.length) {
      throw new SemanticShapeValidationError(`${context} count is invalid.`);
    }

    for (const item of expected) {
      if (!actual.has(item)) {
        throw new SemanticShapeValidationError(`${context} missing '${item}'.`);
      }
    }
  }
}