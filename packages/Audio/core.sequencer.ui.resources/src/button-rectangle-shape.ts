import {
  type IRectangleInput,
  type IRectangleShape,
} from "@monorepo/core-semantic-model-shapes";

export interface ICreateButtonRectangleShapeInput extends IRectangleInput {}

export interface IButtonRectangleShapeFactory {
  create(input: ICreateButtonRectangleShapeInput): IRectangleShape;
}

export function createButtonRectangleShape(
  factory: IButtonRectangleShapeFactory,
  input: ICreateButtonRectangleShapeInput,
): IRectangleShape {
  return factory.create(input);
}
