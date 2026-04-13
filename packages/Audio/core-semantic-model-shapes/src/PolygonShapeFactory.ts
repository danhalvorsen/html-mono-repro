import type { IPolygonInput } from "./IPolygonInput.js";
import type { IPolygonShape } from "./IPolygonShape.js";
import type { IShapeTopologyFactory } from "./IShapeTopologyFactory.js";
import type { IShapeValidator } from "./IShapeValidator.js";
import type { IShapeFactory } from "./IShapeFactory.js";

import { SemanticShapeKinds } from "./types.js";
import { ShapeBuilder } from "./ShapeBuilder.js";

export class PolygonShapeFactory implements IShapeFactory<IPolygonShape, IPolygonInput> {
  public constructor(
    private readonly topologyFactory: IShapeTopologyFactory<IPolygonInput>,
    private readonly validator: IShapeValidator<IPolygonShape>,
    private readonly builder: ShapeBuilder
  ) {}

  public create(input: IPolygonInput): IPolygonShape {
    const shape = this.builder.create({
      id: input.id,
      kind: SemanticShapeKinds.Polygon,
      topology: this.topologyFactory.create(input),
      ...(input.properties ? { properties: input.properties } : {}),
      ...(input.relations ? { relations: input.relations } : {}),
    }) as IPolygonShape;

    this.validator.validate(shape);
    return shape;
  }
}