// packages/Audio/core-semantic-model-shapes/src/LineShapeFactory.ts
import { ILineInput } from "./ILineInput.js";
import { IShapeTopologyFactory } from "./IShapeTopologyFactory.js";
import { ILineShape } from "./ILineShape.js";
import { IShapeValidator } from "./IShapeValidator.js";
import { ShapeBuilder } from "./ShapeBuilder.js";
import { IShapeFactory } from "./IShapeFactory.js";
import { SemanticShapeKinds } from "./types.js";

export class LineShapeFactory implements IShapeFactory<ILineShape, ILineInput> {
  public constructor(
    private readonly topologyFactory: IShapeTopologyFactory<ILineInput>,
    private readonly validator: IShapeValidator<ILineShape>,
    private readonly builder: ShapeBuilder,
  ) {}

  public create(input: ILineInput): ILineShape {
    const shape = this.builder.create({
      id: input.id,
      kind: SemanticShapeKinds.Line,
      topology: this.topologyFactory.create(input),
      ...(input.properties ? { properties: input.properties } : {}),
      ...(input.relations ? { relations: input.relations } : {}),
    }) as ILineShape;

    this.validator.validate(shape);
    return shape;
  }
}