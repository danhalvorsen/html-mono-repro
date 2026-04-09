import type { IRectangleInput } from "./IRectangleInput.js";
import type { IRectangleShape } from "./IRectangleShape.js";
import type { IShapeTopologyFactory } from "./IShapeTopologyFactory.js";
import type { IShapeValidator } from "./IShapeValidator.js";
import type { IShapeFactory } from "./IShapeFactory.js";

import { SemanticShapeKinds } from "./types.js";
import { ShapeBuilder } from "./ShapeBuilder.js";

export class RectangleShapeFactory implements IShapeFactory<IRectangleShape, IRectangleInput> {
  public constructor(
    private readonly topologyFactory: IShapeTopologyFactory<IRectangleInput>,
    private readonly validator: IShapeValidator<IRectangleShape>,
    private readonly builder: ShapeBuilder
  ) {}

  public create(input: IRectangleInput): IRectangleShape {
    const shape = this.builder.create({
      id: input.id,
      kind: SemanticShapeKinds.Rectangle,
      topology: this.topologyFactory.create(input),
      ...(input.properties ? { properties: input.properties } : {}),
      ...(input.relations ? { relations: input.relations } : {}),
    }) as IRectangleShape;

    this.validator.validate(shape);
    return shape;
  }
}