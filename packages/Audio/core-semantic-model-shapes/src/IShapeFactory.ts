import type { IShape } from "./IShape.js";

export interface IShapeFactory<TShape extends IShape, TInput> {
  create(input: TInput): TShape;
}