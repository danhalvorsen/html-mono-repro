import type { IPolylineInput } from "./IPolylineInput.js";
import type { IPolylineShape } from "./IPolylineShape.js";
import type { IShapeTopologyFactory } from "./IShapeTopologyFactory.js";
import type { IShapeValidator } from "./IShapeValidator.js";
import type { IShapeFactory } from "./IShapeFactory.js";

import { SemanticShapeKinds } from "./types.js";
import { ShapeBuilder } from "./ShapeBuilder.js";

export class PolylineShapeFactory implements IShapeFactory<IPolylineShape, IPolylineInput> {
  public constructor(
    private readonly topologyFactory: IShapeTopologyFactory<IPolylineInput>,
    private readonly validator: IShapeValidator<IPolylineShape>,
    private readonly builder: ShapeBuilder
  ) {}

  public create(input: IPolylineInput): IPolylineShape {
  const shape = this.builder.create({
  id: input.id,
  kind: SemanticShapeKinds.Polyline,
  topology: this.topologyFactory.create(input),

  ...(input.properties ? { properties: input.properties } : {}),
  ...(input.relations ? { relations: input.relations } : {}),
}) as IPolylineShape;

    this.validator.validate(shape);
    return shape;
  }
}