// packages/Audio/core-semantic-model-shapes/src/EllipseShapeFactory.ts
import { IEllipseInput } from "./IEllipseInput.js";
import { IEllipseShape } from "./IEllipseShape.js";
import { IShapeTopologyFactory } from "./IShapeTopologyFactory.js";
import { IShapeValidator } from "./IShapeValidator.js";
import { SemanticShapeKinds } from "./types.js";
import { IShapeFactory } from "./IShapeFactory.js";
import { ShapeBuilder } from "./ShapeBuilder.js";

export class EllipseShapeFactory implements IShapeFactory<IEllipseShape, IEllipseInput> {
  public constructor(
    private readonly topologyFactory: IShapeTopologyFactory<IEllipseInput>,
    private readonly validator: IShapeValidator<IEllipseShape>,
    private readonly builder: ShapeBuilder
  ) {}

  public create(input: IEllipseInput): IEllipseShape {
    const shape = this.builder.create({
      id: input.id,
      kind: SemanticShapeKinds.Ellipse,
      topology: this.topologyFactory.create(input),
      ...(input.properties ? { properties: input.properties } : {}),
      ...(input.relations ? { relations: input.relations } : {}),
    }) as IEllipseShape;

    this.validator.validate(shape);
    return shape;
  }
}