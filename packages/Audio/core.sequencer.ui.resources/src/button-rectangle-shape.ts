import { type IRectangleShape } from "@monorepo/core-semantic-model-shapes";

export interface ICreateButtonRectangleShapeInput {
  readonly id: string;
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
}

export interface IButtonRectangleShapeFactory {
  create(input: ICreateButtonRectangleShapeInput): IRectangleShape;
}

export function createButtonRectangleShape(
  factory: IButtonRectangleShapeFactory,
  input: ICreateButtonRectangleShapeInput,
): IRectangleShape {
  return factory.create(input);
}